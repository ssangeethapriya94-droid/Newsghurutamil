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

  // If after all processing, it's still a localhost/placeholder or invalid URL, return the fallback
  if (resolvedUrl.includes("api.newsghuru.com") || resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1") || !/^https?:\/\//i.test(resolvedUrl)) {
    console.warn(`⚠️ [EMAIL SERVICE] Localhost/placeholder/invalid image URL detected: "${imageUrl}". Falling back to public placeholder for email client compatibility.`);
    return FALLBACK_NEWS_IMAGE;
  }

  return resolvedUrl;
};

const getLogoUrl = (lang) => {
  const isEnglish = (lang === "en");
  const filename = isEnglish ? "NEWS%20GHURU%20LOGO%20English.png" : "NEWS%20GHURU%20LOGO%20PNG.png";
  const frontendUrl = isEnglish 
    ? (process.env.FRONTEND_URL || "http://localhost:3001")
    : (process.env.FRONTEND_URL_TA || "http://localhost:3002");

  if (frontendUrl && !frontendUrl.includes("localhost") && !frontendUrl.includes("127.0.0.1")) {
    return `${frontendUrl.replace(/\/$/, "")}/${filename}`;
  }
  
  // GitHub fallback URLs
  return isEnglish 
    ? "https://raw.githubusercontent.com/ssangeethapriya94-droid/Newsghurutamil/main/Newsghuru/users-english/public/NEWS%20GHURU%20LOGO%20English.png"
    : "https://raw.githubusercontent.com/ssangeethapriya94-droid/Newsghurutamil/main/Newsghuru/users-tamil/public/NEWS%20GHURU%20LOGO%20PNG.png";
};

const sendNewsPublishEmail = async (targetLanguage) => {
  try {
    const News = require("../models/News");
    const User = require("../models/User");

    const lang = targetLanguage || "ta";

    // 1. Fetch latest 5 news articles published in the last 24 hours for this language (any category).
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let latestNews = await News.find({
      status: "published",
      language: lang,
      publishedAt: { $gte: twentyFourHoursAgo }
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5);

    if (latestNews.length === 0) {
      console.log(`ℹ️ [EMAIL] No new published articles found in the last 24 hours for language: ${lang}. Skipping email newsletter digest.`);
      return;
    }

    // 2. Fetch all users who have an email, matching the target language
    let userQuery = {};
    if (lang === "en") {
      userQuery = { email: { $exists: true, $ne: "" }, language: "en" };
    } else {
      userQuery = { email: { $exists: true, $ne: "" }, language: { $ne: "en" } };
    }

    const users = await User.find(userQuery).select("email");
    const userEmails = users.map(user => user.email).filter(email => email);

    if (userEmails.length === 0) {
      console.log(`ℹ️ [EMAIL] No users found with language preference matching: ${lang}. Skipping email sending.`);
      return;
    }

    // 3. Build newsletter content
    const isEnglish = (lang === "en");
    
    // Frontend URL
    const frontendUrl = isEnglish 
      ? (process.env.FRONTEND_URL || "http://localhost:3001")
      : (process.env.FRONTEND_URL_TA || "http://localhost:3002");

    // Setup logo URL
    const logoUrl = getLogoUrl(lang);

    const brandName = isEnglish ? "NewsGhuru" : "நியூஸ் குரு";
    const slogan = isEnglish 
      ? "— Your News &nbsp;Your Voice —" 
      : "— உங்கள் செய்தி &nbsp;உங்கள் குரல் —";
    const subject = isEnglish
      ? `📰 NewsGhuru Breaking News: ${latestNews[0].title}`
      : `📰 நியூஸ் குரு உடனடிச் செய்திகள்: ${latestNews[0].title}`;
    const preheader = isEnglish
      ? `NewsGhuru — Breaking news from our website`
      : `நியூஸ் குரு — இன்றைய உடனடிச் செய்திகள்`;
    const headingText = isEnglish ? "BREAKING NEWS" : "உடனடிச் செய்திகள்";

    // Build the list of news articles HTML
    let newsItemsHtml = "";
    for (let i = 0; i < latestNews.length; i++) {
      const item = latestNews[i];
      const newsLink = `${frontendUrl}/news/${item._id}`;
      const imageUrl = item.coverImage || item.image;
      const finalSrc = getPublicImageUrl(imageUrl);

      const isLast = (i === latestNews.length - 1);

      newsItemsHtml += `
        <!-- News Item ${i + 1} -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td>
              <a href="${newsLink}" target="_blank" style="text-decoration: none; display: block;">
                <img
                  src="${finalSrc}"
                  alt="${item.title}"
                  width="540"
                  style="display: block; width: 100%; max-width: 540px; height: auto; border-radius: 8px; object-fit: cover; margin: 0 auto 14px; border: 0; outline: none;"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 10px;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px; line-height: 1.45; font-weight: 700;">
                <a href="${newsLink}" target="_blank" style="color: #0f172a; text-decoration: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                  ${item.title}
                </a>
              </h3>
            </td>
          </tr>
          ${!isLast ? `
          <tr>
            <td style="height: 16px;"></td>
          </tr>
          <tr>
            <td style="height: 1px; background-color: #e2e8f0; padding: 0 10px;"></td>
          </tr>
          ` : ''}
        </table>
      `;
    }

    const mailOptions = {
      from: `"${brandName}" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      bcc: userEmails, // Use BCC to hide user emails from each other
      subject: subject,
      html: `<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'ta'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isEnglish ? 'NewsGhuru Breaking News' : 'நியூஸ் குரு உடனடிச் செய்திகள்'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <!-- Pre-header invisible text -->
  <span style="display:none;font-size:1px;color:#f1f5f9;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);border:1px solid #e2e8f0;">

          <!-- ═══════════════ TOP GRADIENT BAR ═══════════════ -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#ea580c 0%,#f97316 50%,#ea580c 100%);"></td>
          </tr>

          <!-- ═══════════════ HEADER (LIGHT THEME) ═══════════════ -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 24px 20px;border-bottom:1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo image -->
                    <img
                      src="${logoUrl}"
                      alt="${brandName} Logo"
                      width="120"
                      style="display:block;margin:0 auto 12px;border:0;height:auto;width:120px;"
                    />
                    <!-- Brand name -->
                    <div style="font-size:26px;font-weight:800;color:#0f172a;letter-spacing:0.5px;line-height:1.2;margin-bottom:6px;font-family:'Outfit','Inter',Helvetica,Arial,sans-serif;">
                      ${brandName}
                    </div>
                    <!-- Slogan -->
                    <div style="color:#ea580c;font-size:13px;letter-spacing:1.5px;font-weight:600;">
                      ${slogan}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ NEWSLETTER BADGE ═══════════════ -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:20px 24px 10px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#dc2626;border-radius:30px;padding:6px 20px;">
                    <span style="color:#ffffff;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                      &#9889; ${headingText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ NEWS ITEMS LOOP ═══════════════ -->
          <tr>
            <td style="padding:16px 24px 20px;background-color:#ffffff;">
              ${newsItemsHtml}
            </td>
          </tr>

          <!-- ═══════════════ FOOTER (LIGHT THEME) ═══════════════ -->
          <tr>
            <td style="background-color:#f8fafc;padding:32px 24px 28px;border-top:1px solid #e2e8f0;">

              <!-- Follow us text -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <span style="color:#475569;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Follow ${brandName}</span>
                  </td>
                </tr>
              </table>

              <!-- Social icons row -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
                <tr>
                  <!-- Facebook -->
                  <td style="padding:0 12px;">
                    <a href="https://www.facebook.com/share/1JWbyTwjG3/" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- X (Twitter) -->
                  <td style="padding:0 12px;">
                    <a href="https://x.com/news_ghuruTamil" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/twitterx.png" alt="X (Twitter)" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- Instagram -->
                  <td style="padding:0 12px;">
                    <a href="https://www.instagram.com/newsghuru_tamil/" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                  <!-- YouTube -->
                  <td style="padding:0 12px;">
                    <a href="https://youtube.com/@newsghurutamil" target="_blank" style="text-decoration:none; display:block;">
                      <img src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube" width="32" height="32" style="display:block; border:0; outline:none; width:32px; height:32px;" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="height:1px;background-color:#e2e8f0;"></td>
                </tr>
              </table>

              <!-- Copyright -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#64748b;font-size:12px;margin:0 0 8px 0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                      © ${new Date().getFullYear()} ${brandName}. All Rights Reserved.
                    </p>
                    <a href="${frontendUrl}"
                       style="color:#ea580c;font-size:13px;text-decoration:none;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                      ${isEnglish ? 'www.newsghuru.com' : 'www.newsghuru.in'}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Unsubscribe / Notice footer -->
          <tr>
            <td align="center" style="background-color:#f1f5f9;padding:16px 24px;border-top:1px solid #e2e8f0;">
              <p style="color:#64748b;font-size:11px;margin:0;line-height:1.4;">
                You are receiving this email because you registered on ${brandName}.<br/>
                To manage your email preferences, update your settings on our website.
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

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✅ [EMAIL SUCCESS] Sent ${lang} newsletter to ${userEmails.length} subscribed users.`);
    console.log(`   - Accepted: ${info.accepted.length}`);
    if (info.rejected && info.rejected.length > 0) {
      console.log(`   - Failed: ${info.rejected.length}`);
    }
  } catch (error) {
    console.error(`❌ [EMAIL FAILED] Could not send newsletter digest:`, error.message);
  }
};

module.exports = { sendNewsPublishEmail, getTransporter };

