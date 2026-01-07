const express = require("express");
const router = express.Router();

router.get("/open-studio", (req, res) => {
  res.render("pages/open-studio", {
    title: "Open Studio",
    showFooter: true
  });
});

module.exports = router;
