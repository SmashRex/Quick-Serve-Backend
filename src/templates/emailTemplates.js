export function verifyEmailTemplate(verificationUrl) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Verify your QuickServe email</title>

  <!-- Basic reset only. Main styling is inline for email compatibility. -->
  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F4F8F6 !important;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      border: 0;
      display: block;
      max-width: 100%;
    }

    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }

      .mobile-padding {
        padding-left: 22px !important;
        padding-right: 22px !important;
      }

      .content-padding {
        padding-top: 32px !important;
        padding-bottom: 30px !important;
      }

      .mobile-heading {
        font-size: 25px !important;
        line-height: 33px !important;
      }

      .mobile-button {
        width: 100% !important;
      }

      .mobile-button a {
        display: block !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; width:100%; background-color:#F4F8F6; font-family:Arial, Helvetica, sans-serif; color:#1F2937;">

  <!-- Hidden preheader -->
  <div style="display:none; max-height:0; max-width:0; overflow:hidden; opacity:0; color:transparent; font-size:1px; line-height:1px;">
    Welcome to QuickServe. Verify your email to start booking laundry pickups and deliveries.
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#F4F8F6;">
    <tr>
      <td align="center" style="padding:32px 12px 36px;">

        <!-- Email container -->
        <table
          role="presentation"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          class="email-container"
          style="width:100%; max-width:600px; background-color:#FFFFFF; border-radius:14px; overflow:hidden;"
        >

          <!-- ================= HEADER ================= -->
          <tr>
            <td
              align="center"
              class="mobile-padding"
              style="padding:28px 32px 25px; background-color:#FFFFFF;"
            >

              <!-- Logo placeholder -->
              <!-- Replace this text with your actual QuickServe logo image when available. -->
              <div style="font-size:27px; line-height:34px; font-weight:700; letter-spacing:-0.7px; color:#16A34A;">
                Quick<span style="color:#123B5D;">Serve</span>
              </div>

              <div style="margin-top:4px; font-size:12px; line-height:18px; color:#6B7280;">
                Laundry made simple.
              </div>

            </td>
          </tr>

          <!-- Brand accent -->
          <tr>
            <td style="height:4px; background-color:#16A34A; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>


          <!-- ================= HERO / CONTENT ================= -->
          <tr>
            <td
              class="mobile-padding content-padding"
              style="padding:42px 42px 34px; background-color:#FFFFFF;"
            >

              <!-- Small eyebrow -->
              <p style="margin:0 0 12px; font-size:12px; line-height:18px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#16A34A;">
                Welcome to QuickServe
              </p>

              <!-- Heading -->
              <h1
                class="mobile-heading"
                style="margin:0 0 16px; font-size:29px; line-height:38px; font-weight:700; letter-spacing:-0.5px; color:#123B5D;"
              >
                Let’s get your account ready.
              </h1>

              <!-- Intro -->
              <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:#4B5563;">
                Thanks for joining QuickServe. We’re here to make laundry pickup and delivery simple and convenient.
              </p>

              <p style="margin:0 0 28px; font-size:16px; line-height:26px; color:#4B5563;">
                Just verify your email address below and you’ll be ready to start booking your first pickup.
              </p>


              <!-- ================= CTA ================= -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                width="100%"
                class="mobile-button"
                style="width:100%;"
              >
                <tr>
                  <td align="center" style="border-radius:8px; background-color:#16A34A;">

                    <a
                      href="${verificationUrl}"
                      target="_blank"
                      style="display:block; padding:15px 24px; font-size:16px; line-height:22px; font-weight:700; color:#FFFFFF; text-decoration:none; background-color:#16A34A; border:1px solid #16A34A; border-radius:8px;"
                    >
                      Verify My Email
                    </a>

                  </td>
                </tr>
              </table>


              <!-- ================= FALLBACK LINK ================= -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%; margin-top:24px;"
              >
                <tr>
                  <td align="center">

                    <p style="margin:0 0 7px; font-size:12px; line-height:18px; color:#6B7280;">
                      If the button doesn’t work, copy and paste this link:
                    </p>

                    <a
                      href="${verificationUrl }"
                      target="_blank"
                      style="font-size:12px; line-height:18px; color:#155E9A; text-decoration:underline; word-break:break-all;"
                    >
                      ${verificationUrl}
                    </a>

                  </td>
                </tr>
              </table>

            </td>
          </tr>


          <!-- ================= INFO CARD ================= -->
          <tr>
            <td class="mobile-padding" style="padding:0 42px 36px; background-color:#FFFFFF;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%; background-color:#F0FDF4; border:1px solid #DCFCE7; border-radius:9px;"
              >
                <tr>
                  <td style="padding:16px 18px;">

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>

                        <td valign="top" style="padding-right:10px; font-size:16px; line-height:20px;">
                          ✓
                        </td>

                        <td valign="top">
                          <p style="margin:0 0 3px; font-size:13px; line-height:19px; font-weight:700; color:#166534;">
                            Quick and secure
                          </p>

                          <p style="margin:0; font-size:12px; line-height:18px; color:#4B5563;">
                            This verification link is unique to your account and expires in 24 hours.
                          </p>
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>


          <!-- ================= FOOTER ================= -->
          <tr>
            <td
              class="mobile-padding"
              style="padding:30px 32px 28px; background-color:#123B5D; text-align:center;"
            >

              <!-- Footer logo -->
              <div style="font-size:20px; line-height:26px; font-weight:700; letter-spacing:-0.3px; color:#FFFFFF;">
                Quick<span style="color:#4ADE80;">Serve</span>
              </div>

              <p style="margin:7px 0 18px; font-size:12px; line-height:18px; color:#CBD5E1;">
                Simple laundry pickup and delivery.
              </p>

              <p style="margin:0 0 9px; font-size:12px; line-height:18px; color:#94A3B8;">
                Didn’t create a QuickServe account?
                You can safely ignore this email.
              </p>

              <p style="margin:0; font-size:11px; line-height:17px; color:#94A3B8;">
                QuickServe &nbsp;•&nbsp; Company Address Placeholder
              </p>

              <p style="margin:8px 0 0; font-size:11px; line-height:17px;">
                <a
                  href="#"
                  style="color:#93C5FD; text-decoration:underline;"
                >
                  Unsubscribe
                </a>
              </p>

            </td>
          </tr>

        </table>


        <!-- ================= COPYRIGHT ================= -->
        <p style="margin:18px 12px 0; font-size:11px; line-height:17px; color:#94A3B8; text-align:center;">
          © 2026 QuickServe. All rights reserved.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function resetPasswordTemplate(resetUrl) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Reset your QuickServe password</title>
</head>
<body style="margin:0; padding:0; width:100%; background-color:#F4F8F6; font-family:Arial, Helvetica, sans-serif; color:#1F2937;">
  <div style="display:none; max-height:0; max-width:0; overflow:hidden; opacity:0; color:transparent; font-size:1px; line-height:1px;">
    Reset your QuickServe password. This link expires in 1 hour.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:0; padding:0; background-color:#F4F8F6;">
    <tr>
      <td align="center" style="padding:32px 12px 36px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; margin:0 auto; background-color:#FFFFFF; border-radius:14px; overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px 24px 25px; background-color:#FFFFFF;">
              <div style="font-size:27px; line-height:34px; font-weight:700; letter-spacing:-0.7px; color:#16A34A;">
                Quick<span style="color:#123B5D;">Serve</span>
              </div>
              <div style="margin-top:4px; font-size:12px; line-height:18px; color:#6B7280;">
                Laundry made simple.
              </div>
            </td>
          </tr>
          <tr>
            <td style="height:4px; background-color:#16A34A; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:42px 42px 34px; background-color:#FFFFFF;">
              <p style="margin:0 0 12px; font-size:12px; line-height:18px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#16A34A;">
                Password Reset
              </p>
              <h1 style="margin:0 0 16px; font-size:29px; line-height:38px; font-weight:700; letter-spacing:-0.5px; color:#123B5D;">
                Reset your password.
              </h1>
              <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:#4B5563;">
                We received a request to reset the password for your QuickServe account.
              </p>
              <p style="margin:0 0 28px; font-size:16px; line-height:26px; color:#4B5563;">
                If you made this request, use the button below to choose a new password. For your security, this link will expire in <strong style="color:#123B5D;">1 hour</strong>.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td align="center" style="border-radius:8px; background-color:#16A34A;">
                    <a href="${resetUrl}" target="_blank" style="display:block; padding:15px 24px; font-size:16px; line-height:22px; font-weight:700; color:#FFFFFF; text-decoration:none; background-color:#16A34A; border:1px solid #16A34A; border-radius:8px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:24px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 7px; font-size:12px; line-height:18px; color:#6B7280;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <a href="${resetUrl}" target="_blank" style="font-size:12px; line-height:18px; color:#155E9A; text-decoration:underline; word-break:break-all;">
                      ${resetUrl}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 42px 36px; background-color:#FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#F0FDF4; border:1px solid #DCFCE7; border-radius:9px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-right:10px; font-size:16px; line-height:20px; color:#16A34A;">✓</td>
                        <td valign="top">
                          <p style="margin:0 0 3px; font-size:13px; line-height:19px; font-weight:700; color:#166534;">
                            Didn't request a password reset?
                          </p>
                          <p style="margin:0; font-size:12px; line-height:18px; color:#4B5563;">
                            No problem. You can safely ignore this email. Your password will not change unless you use the link above to reset it.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 32px 28px; background-color:#123B5D; text-align:center;">
              <div style="font-size:20px; line-height:26px; font-weight:700; letter-spacing:-0.3px; color:#FFFFFF;">
                Quick<span style="color:#4ADE80;">Serve</span>
              </div>
              <p style="margin:7px 0 18px; font-size:12px; line-height:18px; color:#CBD5E1;">
                Simple laundry pickup and delivery.
              </p>
              <p style="margin:0; font-size:11px; line-height:17px; color:#94A3B8;">
                QuickServe &nbsp;•&nbsp; Company Address Placeholder
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 12px 0; font-size:11px; line-height:17px; color:#94A3B8; text-align:center;">
          © 2026 QuickServe. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}