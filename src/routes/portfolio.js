const express = require("express");
const router = express.Router();

router.get("/portfolio", (req, res) => {
  res.render("pages/portfolio", {
    title: "Portfolio",
    showFooter: true,
    hideCreateOuter: true
  });
});

module.exports = router;
