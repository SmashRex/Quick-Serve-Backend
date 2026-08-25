import { resend, EMAIL_FROM } from '../config/resend.js';

export async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  } catch (err) {
    // Deliberately NOT re-thrown — same reasoning as Firebase writes. A
    // signup/reset flow should not fail entirely just because the email
    // provider had a hiccup; the token still exists in the DB and can be
    // resent or the flow can be retried. Logged so it's visible.
    console.error(`Failed to send email to ${to}:`, err.message);
  }
}