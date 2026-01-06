const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/mythCreation", {
    title: "Myth Creation",
    showFooter: true
  });
});

module.exports = router;
