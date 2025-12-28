import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
};

let cachedTransporter: Transporter | null = null;
const SITE_NAME = "AI Knowledge Hub";

const getEmailConfig = (): EmailConfig => {
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return {
      host: "smtp.gmail.com",
      port: 587,
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
      from: env.GMAIL_USER,
      fromName: SITE_NAME,
    };
  }

  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM) {
    return {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
      fromName: SITE_NAME,
    };
  }

  throw new Error("Email configuration missing");
};

const getTransporter = (): Transporter => {
  if (cachedTransporter) return cachedTransporter;
  const config = getEmailConfig();
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html, replyTo }: SendEmailInput): Promise<void> => {
  const config = getEmailConfig();
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"${config.fromName}" <${config.from}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });
};

type ContactMessage = {
  topic: string;
  title: string;
  message: string;
  email: string;
  phone?: string | null;
  locale: string;
};

const buildAdminContent = (payload: ContactMessage): { subject: string; text: string } => {
  const subject = `[Contact] ${payload.topic} - ${payload.title}`;
  const textLines = [
    `${SITE_NAME} – New contact request`,
    ``,
    `Topic: ${payload.topic}`,
    `Title: ${payload.title}`,
    `Message:`,
    `${payload.message}`,
    ``,
    `From: ${payload.email}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Locale: ${payload.locale}`,
  ];
  return { subject, text: textLines.join("\n") };
};

const buildUserContent = (payload: ContactMessage): { subject: string; text: string } => {
  const subject = `${SITE_NAME} — We received your request`;
  const textLines = [
    `Hi,`,
    `thanks for contacting ${SITE_NAME}. We received your message and will reply within 2 business days.`,
    ``,
    `Summary`,
    `- Topic: ${payload.topic}`,
    `- Title: ${payload.title}`,
    ``,
    `Your message:`,
    `${payload.message}`,
    ``,
    `If you need to add details, reply to this email.`,
  ];
  return { subject, text: textLines.join("\n") };
};

const sendContactEmails = async (payload: ContactMessage): Promise<void> => {
  const adminEmail = env.ADMIN_EMAIL ?? env.SUPERADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("Admin email not configured");
  }
  const adminContent = buildAdminContent(payload);
  const userContent = buildUserContent(payload);

  await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: adminContent.subject,
      text: adminContent.text,
      replyTo: payload.email,
    }),
    sendEmail({
      to: payload.email,
      subject: userContent.subject,
      text: userContent.text,
    }),
  ]);
};

export type { ContactMessage };
export { sendEmail, sendContactEmails };


