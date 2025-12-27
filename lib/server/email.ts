import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, text, html, replyTo }: SendEmailInput): Promise<void> => {
  await transporter.sendMail({
    from: env.SMTP_FROM,
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
  const adminContent = buildAdminContent(payload);
  const userContent = buildUserContent(payload);

  await Promise.all([
    sendEmail({
      to: env.SUPERADMIN_EMAIL,
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


