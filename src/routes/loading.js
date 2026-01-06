const express = require("express");
const router = express.Router();

router.get("/loading", (req, res) => {
  const { to = "/", label = "" } = req.query;

  res.render("pages/loading", {
    title: "Loading",
    targetUrl: to,
    label,
    isHome: false,
    showFooter: false
  });
});

module.exports = router;
