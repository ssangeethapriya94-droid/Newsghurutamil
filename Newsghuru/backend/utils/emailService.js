const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Define path to the project logo for email attachment
const LOGO_PATH = path.join(__dirname, "../../users/public/NEWS GHURU LOGO PNG.png");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const secure = process.env.SMTP_SECURE === "false" ? false : (port === 465);

    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

// Perform diagnostic check on startup
const runDiagnostic = async () => {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  console.log("\n📧 [EMAIL SERVICE] Running SMTP connection diagnostics on load...");
  console.log(`- SMTP_EMAIL length: ${email ? email.length : 0}`);
  console.log(`- SMTP_PASSWORD length: ${password ? password.length : 0}`);

  if (!email || email.includes("your_email_here") || !password || password.includes("your_16_character_app_password_here")) {
    console.warn("⚠️ [EMAIL SERVICE] WARNING: Default placeholders detected in environment variables. Email notifications will fail until real credentials are saved in backend/.env.");
    return;
  }

  if (/^\s|\s$/.test(email)) {
    console.warn("⚠️ [EMAIL SERVICE] WARNING: SMTP_EMAIL contains leading or trailing whitespace.");
  }
  if (/^\s|\s$/.test(password)) {
    console.warn("⚠️ [EMAIL SERVICE] WARNING: SMTP_PASSWORD contains leading or trailing whitespace.");
  }

  try {
    const t = getTransporter();
    await t.verify();
    console.log("✅ [EMAIL SERVICE] SMTP transporter verified and ready to send emails.");
  } catch (err) {
    console.error("❌ [EMAIL SERVICE] SMTP verification failed:");
    console.error(`   - Error Code: ${err.code}`);
    console.error(`   - Error Message: ${err.message}`);
    if (err.response) console.error(`   - SMTP Response: ${err.response}`);
    console.error("   👉 Please check backend/.env. If using Gmail, you MUST use a 16-character App Password (not your regular account password) and ensure 2FA is enabled.");
  }
};

// Run diagnostics in the background on module load (safely catch errors)
runDiagnostic().catch((err) => {
  console.error("❌ [EMAIL SERVICE] Unexpected error during startup SMTP diagnostics:", err);
});

const sendNewsPublishEmail = async (userEmails, news) => {
  if (!userEmails || userEmails.length === 0) {
    console.log("ℹ️ [EMAIL] No subscribed users found to send notifications to.");
    return;
  }

  // Fallback to localhost:3001 if FRONTEND_URL is not provided
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
  const newsLink = `${frontendUrl}/news/${news._id}`;
  
  const formattedDate = new Date(news.publishedAt || news.date || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Ensure the news image is an absolute URL for email clients
  const rawImage = news.image || news.coverImage;
  const absoluteImageUrl = rawImage && rawImage.startsWith('/') 
    ? `${frontendUrl}${rawImage}` 
    : rawImage;

  const mailOptions = {
    from: `"NewsGhuru" <${process.env.SMTP_EMAIL}>`,
    to: process.env.SMTP_EMAIL,
    bcc: userEmails, // Use BCC to hide user emails from each other
    subject: `📰 NewsGhuru Breaking News: ${news.title}`,
    attachments: [
      {
        filename: 'NEWS_GHURU_LOGO.png',
        path: LOGO_PATH,
        cid: 'newsghurulogo' // same cid value as in the html img src
      }
    ],
    html: `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NewsGhuru Breaking News</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <!-- Pre-header invisible text -->
  <span style="display:none;font-size:1px;color:#f0f4f8;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    நியூஸ் குரு — ${news.title}
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f8;padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- ═══════════════ HEADER ═══════════════ -->
          <tr>
            <td style="background-color:#0f172a;padding:0;">
              <!-- Top orange accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:5px;background:linear-gradient(90deg,#ea580c 0%,#f97316 50%,#ea580c 100%);"></td>
                </tr>
              </table>
              <!-- Logo + Brand row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:22px 20px 18px;">
                    <!-- Logo image -->
                    <img
                      src="cid:newsghurulogo"
                      alt="நியூஸ் குரு Logo"
                      width="90"
                      style="display:block;margin:0 auto 10px;border:0;height:auto;"
                    />
                    <!-- Tamil brand name -->
                    <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;line-height:1.1;margin-bottom:4px;">
                      நியூஸ் குரு
                    </div>
                    <!-- Slogan with orange dashes -->
                    <div style="color:#f97316;font-size:13px;letter-spacing:2px;font-weight:600;">
                      — உங்கள் செய்தி &nbsp;உங்கள் குரல் —
                    </div>
                  </td>
                </tr>
              </table>
              <!-- Bottom orange accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#ea580c 0%,#f97316 50%,#ea580c 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ BREAKING NEWS BADGE ═══════════════ -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:22px 20px 14px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#dc2626;border-radius:30px;padding:7px 22px;">
                    <span style="color:#ffffff;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                      &#9889; BREAKING NEWS
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ FEATURED IMAGE ═══════════════ -->
          ${absoluteImageUrl ? `
          <tr>
            <td style="padding:0 20px;">
              <img
                src="${absoluteImageUrl}"
                alt="${news.title}"
                width="560"
                style="display:block;width:100%;max-width:560px;height:auto;border-radius:10px;object-fit:cover;"
              />
            </td>
          </tr>
          ` : ''}

          <!-- ═══════════════ CONTENT BODY ═══════════════ -->
          <tr>
            <td style="padding:24px 28px 10px;">

              <!-- Category pill -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td style="background-color:#ea580c;border-radius:30px;padding:5px 16px;">
                    <span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                      ${news.category || 'செய்தி'}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- News title -->
              <h2 style="color:#0f172a;font-size:22px;font-weight:800;line-height:1.35;margin:0 0 10px 0;">
                ${news.title}
              </h2>

              <!-- Subtitle -->
              ${news.subtitle ? `
              <p style="color:#475569;font-size:15px;line-height:1.55;margin:0 0 14px 0;">
                ${news.subtitle}
              </p>
              ` : ''}

              <!-- Date -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
                <tr>
                  <td valign="middle" style="padding-right:7px;">
                    <span style="font-size:16px;">&#128197;</span>
                  </td>
                  <td valign="middle">
                    <span style="color:#64748b;font-size:13px;font-weight:600;">${formattedDate}</span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="height:1px;background-color:#e2e8f0;"></td>
                </tr>
              </table>

              <!-- News Summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff7ed;border-radius:10px;border:1px solid #ffedd5;margin-bottom:26px;">
                <tr>
                  <td valign="top" style="padding:16px 12px 16px 16px;width:60px;">
                    <!-- Newspaper icon circle -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" style="width:48px;height:48px;background-color:#fde8d4;border-radius:50%;border:2px solid #ea580c;">
                          <span style="font-size:22px;line-height:1;">&#128240;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="padding:16px 16px 16px 4px;">
                    <div style="color:#ea580c;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:7px;">
                      NEWS SUMMARY
                    </div>
                    <div style="color:#374151;font-size:14px;line-height:1.65;">
                      ${news.shortDescription || news.subtitle || 'Click the button below to read the full coverage of this breaking story on NewsGhuru.'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                <tr>
                  <td align="center">
                    <a href="${newsLink}"
                       style="display:inline-block;background-color:#ea580c;color:#ffffff;font-size:15px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:15px 48px;border-radius:8px;">
                      READ FULL NEWS &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ═══════════════ FOOTER ═══════════════ -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 20px 24px;">

              <!-- Follow us text -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;">Follow NewsGhuru</span>
                  </td>
                </tr>
              </table>

              <!-- Social icons row -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
                <tr>
                  <!-- Facebook -->
                  <td style="padding:0 8px;">
                    <a href="https://www.facebook.com/share/1JWbyTwjG3/" style="text-decoration:none;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle"
                              style="width:42px;height:42px;background-color:#1877f2;border-radius:50%;">
                            <span style="color:#ffffff;font-size:20px;font-weight:900;line-height:1;font-family:Arial,sans-serif;">f</span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- X / Twitter -->
                  <td style="padding:0 8px;">
                    <a href="https://x.com/news_ghuruTamil" style="text-decoration:none;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle"
                              style="width:42px;height:42px;background-color:#000000;border-radius:50%;">
                            <span style="color:#ffffff;font-size:17px;font-weight:900;line-height:1;font-family:Arial,sans-serif;">&#120143;</span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- Instagram -->
                  <td style="padding:0 8px;">
                    <a href="https://www.instagram.com/newsghuru_tamil/" style="text-decoration:none;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle"
                              style="width:42px;height:42px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:50%;">
                            <span style="color:#ffffff;font-size:20px;line-height:1;">&#128247;</span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- YouTube -->
                  <td style="padding:0 8px;">
                    <a href="https://youtube.com/@newsghurutamil" style="text-decoration:none;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle"
                              style="width:42px;height:42px;background-color:#ff0000;border-radius:50%;">
                            <span style="color:#ffffff;font-size:17px;line-height:1;">&#9654;</span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td style="height:1px;background-color:#1e293b;"></td>
                </tr>
              </table>

              <!-- Copyright -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#94a3b8;font-size:12px;margin:0 0 6px 0;">
                      © ${new Date().getFullYear()} NewsGhuru. All Rights Reserved.
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}"
                       style="color:#ea580c;font-size:12px;text-decoration:none;font-weight:600;">
                      www.newsghuru.com
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Unsubscribe notice -->
          <tr>
            <td align="center" style="background-color:#f8fafc;padding:12px 20px;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                You are receiving this email because you are a registered user of NewsGhuru.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email Card -->

      </td>
    </tr>
  </table>

</body>
</html>`,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✅ [EMAIL SUCCESS] Sent notification to ${userEmails.length} subscribed users.`);
    console.log(`   - Accepted: ${info.accepted.length}`);
    if (info.rejected && info.rejected.length > 0) {
      console.log(`   - Failed: ${info.rejected.length}`);
    }
  } catch (error) {
    console.error(`❌ [EMAIL FAILED] Could not send notifications to users:`);
    console.error(`   - Error Message: ${error.message}`);
    console.error(`   - Error Code: ${error.code}`);
    if (error.response) {
      console.error(`   - SMTP Response: ${error.response}`);
    }
    console.error(`   - Stack Trace: ${error.stack}`);
  }
};

module.exports = { sendNewsPublishEmail, getTransporter };

