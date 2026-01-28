const express = require("express");
const router = express.Router();

router.get("/counter-display", async (req, res) => {
  res.render("pages/counter-display", {
    title: "Counter Display",
    showFooter: true,
  });
});

module.exports = router;
