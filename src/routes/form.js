const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// create a reusable transporter using SMTP settings from environment
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3"
  }
});

// verify configuration at startup (optional but useful for debugging)
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP configuration error:", err);
  } else {
    console.log("SMTP server is ready to take messages");
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
  // collect all form fields; interest defaults to a placeholder if missing
  const formData = Object.assign({}, req.body);
  formData.interest = formData.interest || "None selected";

  console.log("Form Data:", formData);

  // prepare HTML body using a dedicated template
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
  } catch (err) {
    console.error("Error rendering email template:", err);
    // fallback: build body manually from keys
    htmlBody = '<p>New submission received.</p>' +
      Object.entries(formData)
        .map(([k,v]) => `<strong>${k}:</strong> ${v}<br>`)
        .join('');
  }

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    // send to a configured address or fallback to the sender
    to: process.env.MAIL_TO_ADDRESS || process.env.MAIL_FROM_ADDRESS,
    subject: `New form submission from ${formData.name || 'unknown'}`,
    html: htmlBody
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render("pages/form", {
      title: "Form",
      success: true,
      hideCreateOuter: true,
    });
  } catch (error) {
    console.error("Failed to send email", error);
    res.render("pages/form", {
      title: "Form",
      success: false,
      error: "Unable to send email at this time. Please try again later.",
      hideCreateOuter: true,
    });
  }
});

module.exports = router;