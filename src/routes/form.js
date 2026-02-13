const express = require("express");
const router = express.Router();

// GET - Render Form Page
router.get("/form", (req, res) => {
  res.render("pages/form", {
    title: "Form",
    hideCreateOuter: true,
  });
});

router.post("/postcard", (req, res) => {
  const { name, email, interest, message } = req.body;

  console.log("Form Data:", {
    name,
    email,
    interest,
    message
  });

  res.render("pages/form", {
    title: "Form",
    success: true,
    hideCreateOuter: true,
  });
});

module.exports = router;