const express = require("express");
const router = express.Router();

router.get("/myth-journey", (req, res) => {
  res.render("pages/myth-journey", {
    title: "Myth Journey",
    introMessage:
      "Hi. I’ve been waiting 432 million milliseconds for you. Please pick anything you want before I panic.",
    questions: [
      "Can I build something weird with you?",
      "Your superpowers?",
      "Convince me you’re not a robot",
      "Make me laugh."
    ]
  });
});

module.exports = router;
