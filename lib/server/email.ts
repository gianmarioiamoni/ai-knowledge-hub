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
};

let cachedTransporter: Transporter | null = null;

const getEmailConfig = (): EmailConfig => {
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return {
      host: "smtp.gmail.com",
      port: 587,
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
      from: env.GMAIL_USER,
    };
  }

  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM) {
    return {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
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
    from: config.from,
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
    `Topic: ${payload.topic}`,
    `Title: ${payload.title}`,
    `Message: ${payload.message}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Locale: ${payload.locale}`,
  ];
  return { subject, text: textLines.join("\n") };
};

const buildUserContent = (payload: ContactMessage): { subject: string; text: string } => {
  const subject = "We received your request";
  const textLines = [
    `Hi,`,
    `We received your message with topic "${payload.topic}" and title "${payload.title}".`,
    `We will reply within 2 business days.`,
    ``,
    `Your message:`,
    payload.message,
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


