import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error(
      'Missing SMTP configuration. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM',
    );
  }

  const secure =
    process.env.SMTP_SECURE != null
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from,
  };
}

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const smtp = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  return transporter.sendMail({
    from: smtp.from,
    to: to.join(','),
    subject,
    text,
    html,
  });
}
