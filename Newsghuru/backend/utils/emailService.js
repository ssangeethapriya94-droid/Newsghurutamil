const nodemailer = require("nodemailer");

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

  const mailOptions = {
    from: `"NewsGhuru" <${process.env.SMTP_EMAIL}>`,
    to: process.env.SMTP_EMAIL,
    bcc: userEmails, // Use BCC to hide user emails from each other
    subject: `📰 NewsGhuru Breaking News: ${news.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; border-bottom: 4px solid #ea580c;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">News<span style="color: #ea580c;">Ghuru</span></h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="display: inline-block; background-color: #fff7ed; color: #ea580c; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; border: 1px solid #ffedd5;">
            ${news.category || 'News'}
          </div>
          <h2 style="color: #1e293b; margin-top: 0; font-size: 22px; line-height: 1.4;">${news.title}</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">🗓️ ${formattedDate}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #ea580c; color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            ${news.shortDescription || news.subtitle || 'Click below to read the full coverage of this breaking story.'}
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${newsLink}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2);">
              Read Full News
            </a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">You are receiving this email because you are subscribed to NewsGhuru notifications.</p>
          <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} NewsGhuru. All rights reserved.</p>
        </div>
      </div>
    `,
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

