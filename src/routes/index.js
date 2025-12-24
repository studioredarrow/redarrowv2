const express = require("express");
const router = express.Router();
const { client } = require("../prismic");

router.get("/", async (req, res) => {
  try {
    const doc = await client.getSingle("intro_page");

    const intro = {
      title: doc.data.page_title?.[0]?.text,
      introText: doc.data.intro_text?.[0]?.text,
      ctaLabel: doc.data.cta_label,
      questions: doc.data.question_buttons?.map(item => item.label),
    };

    res.render("pages/intro", {
      title: "Intro",
      intro,
    });
  } catch (err) {
    console.error("Prismic error:", err);
    res.status(500).send("CMS Error");
  }
});

module.exports = router;
