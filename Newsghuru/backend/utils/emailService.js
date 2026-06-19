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

const FALLBACK_NEWS_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

const getPublicImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
    return FALLBACK_NEWS_IMAGE;
  }

  const trimmedUrl = imageUrl.trim();

  // If it's already a public absolute URL (not localhost), return it
  if (/^https?:\/\//i.test(trimmedUrl) && !trimmedUrl.includes("localhost") && !trimmedUrl.includes("127.0.0.1")) {
    return trimmedUrl;
  }

  // Determine base URLs
  const frontendUrl = process.env.FRONTEND_URL || "https://newsghuru.com";
  const backendUrl = process.env.BACKEND_URL || process.env.REACT_APP_API_URL || "https://api.newsghuru.com";

  let resolvedUrl = trimmedUrl;

  // Handle relative paths
  if (resolvedUrl.startsWith("/")) {
    if (resolvedUrl.includes("/uploads/")) {
      resolvedUrl = `${backendUrl.replace(/\/$/, "")}${resolvedUrl}`;
    } else {
      resolvedUrl = `${frontendUrl.replace(/\/$/, "")}${resolvedUrl}`;
    }
  }

  // Replace localhost or 127.0.0.1 with the configured public backendUrl/frontendUrl if they are defined
  if (resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1")) {
    const localhostPattern = /https?:\/\/localhost:\d+/gi;
    const loopbackPattern = /https?:\/\/127\.0\.0\.1:\d+/gi;

    if (resolvedUrl.includes("/uploads/")) {
      const targetBackend = (backendUrl && !backendUrl.includes("localhost") && !backendUrl.includes("127.0.0.1")) 
        ? backendUrl 
        : "https://api.newsghuru.com";
      resolvedUrl = resolvedUrl.replace(localhostPattern, targetBackend).replace(loopbackPattern, targetBackend);
    } else {
      const targetFrontend = (frontendUrl && !frontendUrl.includes("localhost") && !frontendUrl.includes("127.0.0.1")) 
        ? frontendUrl 
        : "https://newsghuru.com";
      resolvedUrl = resolvedUrl.replace(localhostPattern, targetFrontend).replace(loopbackPattern, targetFrontend);
    }
  }

  // If after all processing, it's still a localhost or invalid URL, return the fallback
  if (resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1") || !/^https?:\/\//i.test(resolvedUrl)) {
    console.warn(`⚠️ [EMAIL SERVICE] Localhost/invalid image URL detected: "${imageUrl}". Falling back to public placeholder for email client compatibility.`);
    return FALLBACK_NEWS_IMAGE;
  }

  return resolvedUrl;
};

const getLogoUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl && !frontendUrl.includes("localhost") && !frontendUrl.includes("127.0.0.1")) {
    return `${frontendUrl.replace(/\/$/, "")}/NEWS%20GHURU%20LOGO%20PNG.png`;
  }
  return "https://raw.githubusercontent.com/ssangeethapriya94-droid/Newsghurutamil/main/Newsghuru/users/public/NEWS%20GHURU%20LOGO%20PNG.png";
};

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

  const finalImageUrl = getPublicImageUrl(news.coverImage || news.image);
  const logoUrl = getLogoUrl();

  const mailOptions = {
    from: `"NewsGhuru" <${process.env.SMTP_EMAIL}>`,
    to: process.env.SMTP_EMAIL,
    bcc: userEmails, // Use BCC to hide user emails from each other
    subject: `📰 NewsGhuru Breaking News: ${news.title}`,
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
                      src="${logoUrl}"
                      alt="நியூஸ் குரு Logo"
                      width="90"
                      style="display:block;margin:0 auto 10px;border:0;height:auto;width:90px;"
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
          <tr>
            <td style="padding:0 20px;">
              <img
                src="${finalImageUrl}"
                alt="${news.title}"
                width="560"
                style="display:block;width:560px;max-width:100%;height:auto;border-radius:10px;object-fit:cover;"
              />
            </td>
          </tr>

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
                  <td style="padding:0 10px;">
                    <a href="https://www.facebook.com/share/1JWbyTwjG3/" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- X (Twitter) -->
                  <td style="padding:0 10px;">
                    <a href="https://x.com/news_ghuruTamil" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/twitterx.png" alt="X (Twitter)" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- Instagram -->
                  <td style="padding:0 10px;">
                    <a href="https://www.instagram.com/newsghuru_tamil/" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- YouTube -->
                  <td style="padding:0 10px;">
                    <a href="https://youtube.com/@newsghurutamil" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
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

