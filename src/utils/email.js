import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `QuickServe <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Deliberately NOT re-thrown — same reasoning as Firebase writes. A
    // signup/reset flow should not fail entirely just because the email
    // provider had a hiccup; the token still exists in the DB and can be
    // resent or the flow can be retried. Logged so it's visible.
    console.error(`Failed to send email to ${to}:`, err.message);
  }
}
