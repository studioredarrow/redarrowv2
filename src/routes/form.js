const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const mailHost = process.env.MAIL_HOST;
const mailPort = parseInt(process.env.MAIL_PORT, 10) || 587;
const mailUser = process.env.MAIL_USERNAME;
const mailPass = process.env.MAIL_PASSWORD;

// Log mail config at startup (no passwords). If host is missing, nodemailer falls back to 127.0.0.1
if (!mailHost) {
  console.warn("[form] MAIL_HOST is not set; SMTP will try 127.0.0.1 and likely fail. Check .env path and vars.");
}
console.log("[form] SMTP config:", {
  host: mailHost || "(undefined → 127.0.0.1)",
  port: mailPort,
  user: mailUser ? `${mailUser.slice(0, 3)}***` : "(undefined)",
  fromAddress: process.env.MAIL_FROM_ADDRESS || "(undefined)",
});

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: false,
  auth: mailUser && mailPass ? { user: mailUser, pass: mailPass } : undefined,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("[form] SMTP verify failed:", err.message);
    console.error("[form] SMTP error details:", {
      code: err.code,
      address: err.address,
      port: err.port,
      command: err.command,
    });
  } else {
    console.log("[form] SMTP server is ready to take messages");
  }
});

// GET - Render Form Page
router.get("/form", (req, res) => {
  res.render("pages/form", {
    title: "Form",
    hideCreateOuter: true,
  });
});

// POST - receive form submission and send email
router.post("/postcard", async (req, res) => {
  const required = ["MAIL_HOST", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM_NAME", "MAIL_FROM_ADDRESS"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("[form] Mail not sent: missing env vars:", missing.join(", "));
    return res.render("pages/form", {
      title: "Form",
      success: false,
      error: "Email is not configured. Please contact the site administrator.",
      hideCreateOuter: true,
    });
  }

  const formData = Object.assign({}, req.body);
  formData.interest = formData.interest || "None selected";
  console.log("[form] Form data received:", { name: formData.name, email: formData.email, interest: formData.interest });

  let htmlBody;
  try {
    htmlBody = await new Promise((resolve, reject) => {
      req.app.render(
        "emails/formSubmission",
        { formData },
        (err, rendered) => {
          if (err) return reject(err);
          resolve(rendered);
        }
      );
    });
    console.log("[form] Email template rendered OK");
  } catch (err) {
    console.error("[form] Error rendering email template:", err.message);
    htmlBody = '<p>New submission received.</p>' +
      Object.entries(formData)
        .map(([k, v]) => `<strong>${k}:</strong> ${v}<br>`)
        .join('');
  }

  const toAddress = process.env.MAIL_TO_ADDRESS || process.env.MAIL_FROM_ADDRESS;
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: toAddress,
    subject: `New form submission from ${formData.name || "unknown"}`,
    html: htmlBody,
  };
  console.log("[form] Sending email to:", toAddress);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[form] Email sent successfully:", info.messageId || "(no messageId)");
    res.render("pages/form", {
      title: "Form",
      success: true,
      hideCreateOuter: true,
    });
  } catch (error) {
    console.error("[form] Failed to send email:", error.message);
    console.error("[form] Error details:", {
      code: error.code,
      address: error.address,
      port: error.port,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    res.render("pages/form", {
      title: "Form",
      success: false,
      error: "Unable to send email at this time. Please try again later.",
      hideCreateOuter: true,
    });
  }
});

// POST - footer signup (same mail config, sends to same address)
router.post("/footer-signup", async (req, res) => {
  const required = ["MAIL_HOST", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM_NAME", "MAIL_FROM_ADDRESS"];
  const missing = required.filter((key) => !process.env[key]);
  const redirectBack = req.get("Referer") || "/";

  if (missing.length) {
    console.error("[form] Footer signup: missing env vars:", missing.join(", "));
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=error");
  }

  const email = (req.body.email || "").trim();
  if (!email) {
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=missing");
  }
  const toAddress = process.env.MAIL_TO_ADDRESS || process.env.MAIL_FROM_ADDRESS;
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: toAddress,
    subject: `Footer signup: ${email}`,
    html: `<p><strong>New footer signup</strong></p><p>Email: <a href="mailto:${email}">${email}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("[form] Footer signup email sent to:", toAddress, "for:", email);
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=success");
  } catch (error) {
    console.error("[form] Footer signup failed:", error.message);
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=error");
  }
});

module.exports = router;