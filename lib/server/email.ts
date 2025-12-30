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
const adminEmail = env.ADMIN_EMAIL ?? env.SUPERADMIN_EMAIL;

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
const sendAdminNewUser = async (email: string): Promise<void> => {
  if (!adminEmail) return;
  const subject = `${SITE_NAME} – New user signup`;
  const text = [`A new user signed up:`, `Email: ${email}`, ``].join("\n");
  await sendEmail({ to: adminEmail, subject, text });
};

const sendAdminSubscriptionChange = async (payload: {
  userEmail: string | null;
  planId: string | null;
  billingCycle?: string | null;
}): Promise<void> => {
  if (!adminEmail) return;
  const subject = `${SITE_NAME} – Subscription update`;
  const text = [
    `User: ${payload.userEmail ?? "unknown"}`,
    `Plan: ${payload.planId ?? "unknown"}`,
    `Billing: ${payload.billingCycle ?? "unknown"}`,
  ].join("\n");
  await sendEmail({ to: adminEmail, subject, text });
};

const sendAdminAccountDeleted = async (email: string): Promise<void> => {
  if (!adminEmail) return;
  const subject = `${SITE_NAME} – Account deleted`;
  const text = [`User deleted account: ${email}`].join("\n");
  await sendEmail({ to: adminEmail, subject, text });
};

const sendUserPlanReminder = async (payload: {
  to: string;
  daysLeft: number;
  planId: string | null;
  renewalAt?: string | null;
}): Promise<void> => {
  const subject = `${SITE_NAME} — Your plan renews soon`;
  const text = [
    `Hi,`,
    `your plan "${payload.planId ?? "current plan"}" will renew/expire in ${payload.daysLeft} day${
      payload.daysLeft === 1 ? "" : "s"
    }.`,
    payload.renewalAt ? `Date: ${payload.renewalAt}` : "",
    ``,
    `If you need changes, update your plan from the dashboard.`,
  ]
    .filter(Boolean)
    .join("\n");
  await sendEmail({ to: payload.to, subject, text });
};

const sendInviteEmail = async (payload: {
  to: string;
  token: string;
  orgName: string;
  role: string;
  locale: string;
}): Promise<void> => {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const link = `${origin}/${payload.locale}/invite/accept?token=${payload.token}`;
  const subject = `${SITE_NAME} – You’re invited to ${payload.orgName}`;
  const text = [
    `Hi,`,
    `You have been invited to join ${payload.orgName} as ${payload.role}.`,
    `Accept the invitation: ${link}`,
  ].join("\n");
  const html = `
    <p>Hi,</p>
    <p>You have been invited to join <strong>${payload.orgName}</strong> as <strong>${payload.role}</strong>.</p>
    <p><a href="${link}">Accept invitation</a></p>
  `;
  await sendEmail({ to: payload.to, subject, text, html });
};

export {
  sendEmail,
  sendContactEmails,
  sendAdminNewUser,
  sendAdminSubscriptionChange,
  sendAdminAccountDeleted,
  sendUserPlanReminder,
  sendInviteEmail,
};


