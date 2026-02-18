import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || undefined);

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

  // Skip sending if no API key configured (development)
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Verification email for ${email}: ${verifyUrl}`);
    return;
  }

  await resend.emails.send({
    from: "Nocho <noreply@nocho.ng>",
    to: email,
    subject: "Verify your Nocho account",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #111; border-radius: 16px; padding: 40px; border: 1px solid #222;">
          <h1 style="color: #8B1E1E; font-size: 24px; margin: 0 0 20px;">Welcome to Nocho!</h1>
          <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
            Thanks for signing up. Click the button below to verify your email address and start competing in knowledge arenas.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #8B1E1E; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: 600;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">
            If you didn't create an account on Nocho, you can ignore this email.
          </p>
          <p style="color: #666; font-size: 13px;">
            This link expires in 24 hours.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
