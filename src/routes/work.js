const express = require("express");
const router = express.Router();

router.get("/work", (req, res) => {
  res.render("pages/work", {
    title: "Work",
    showFooter: true
  });
});

module.exports = router;
