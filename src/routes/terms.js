const express = require("express");
const router = express.Router();

router.get("/terms-and-conditions", (req, res) => {
  res.render("pages/terms", {
    title: "Terms & Conditions",
    showFooter: true,
    hideCreateOuter: true
  });
});

module.exports = router;
