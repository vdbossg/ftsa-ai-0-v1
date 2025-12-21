// server/routes/ftsaWelcomeRoutes.js
const { sendEmail } = require("../utils/emailService");

async function sendWelcomeEmail(email, firstName = "Trader") {
  const subject = "Welcome to FTSA AI 🚀";

  const html = `
    <div style="text-align:center; margin-bottom:20px;">
      <img 
        src="https://ftsa-ai-0-v1.netlify.app/assets/images/ftsa-email-logo.png"
        alt="FTSA AI"
        width="140"
        style="display:block;margin:0 auto 20px auto;"
      />
    </div>

    <p>Hi ${firstName},</p>

    <p>Welcome to <strong>FTSA AI</strong>! Your account has been created successfully.</p>

    <p><strong>Your login email:</strong> ${email}</p>

    <p>You can now log in and start using the platform.</p>

    <p style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/login"
         style="display:inline-block;
                padding:12px 24px;
                background:#007bff;
                color:#ffffff;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;">
        Login to FTSA AI
      </a>
    </p>

    <p>If you ever forget your password, use the “Forgot Password” option.</p>

    <p>Happy trading,<br/>
    <strong>The FTSA AI Team</strong></p>
  `;

  await sendEmail(email, subject, html);
}

module.exports = { sendWelcomeEmail };
