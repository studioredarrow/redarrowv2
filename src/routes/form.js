const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("[form] RESEND_API_KEY is not set. Email sending will fail. Check .env path and vars.");
} else {
  console.log("[form] Resend API initialized successfully");
}

let resendClient;
function getResend() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

// Email configuration
const MAIL_FROM_ADDRESS = "onboarding@resend.dev";
const MAIL_TO_ADDRESS = "developer@redarrow.ltd";
const MAIL_FROM_NAME = "Red Arrow";

// GET - Render Form Page
router.get("/form", (req, res) => {
  res.render("pages/form", {
    title: "Form",
    hideCreateOuter: true,
  });
});

// POST - receive form submission and send email
router.post("/postcard", async (req, res) => {
  const required = ["RESEND_API_KEY"];
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

  const mailOptions = {
    from: `${MAIL_FROM_NAME} <${MAIL_FROM_ADDRESS}>`,
    to: MAIL_TO_ADDRESS,
    subject: `New form submission from ${formData.name || "unknown"}`,
    html: htmlBody,
  };
  console.log("[form] Sending email to:", MAIL_TO_ADDRESS);

  try {
    const info = await getResend().emails.send(mailOptions);
    console.log("[form] Email sent successfully:", info.id || "(no id)");
    res.render("pages/form", {
      title: "Form",
      success: true,
      hideCreateOuter: true,
    });
  } catch (error) {
    console.error("[form] Failed to send email:", error.message);
    console.error("[form] Error details:", error);
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
  const required = ["RESEND_API_KEY"];
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

  const mailOptions = {
    from: `${MAIL_FROM_NAME} <${MAIL_FROM_ADDRESS}>`,
    to: MAIL_TO_ADDRESS,
    subject: `Footer signup: ${email}`,
    html: `<p><strong>New footer signup</strong></p><p>Email: <a href="mailto:${email}">${email}</a></p>`,
  };

  try {
    await getResend().emails.send(mailOptions);
    console.log("[form] Footer signup email sent to:", MAIL_TO_ADDRESS, "for:", email);
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=success");
  } catch (error) {
    console.error("[form] Footer signup failed:", error.message);
    return res.redirect(redirectBack + (redirectBack.includes("?") ? "&" : "?") + "footer_signup=error");
  }
});

module.exports = router;
