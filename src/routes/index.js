const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/", async (req, res) => {
  try {
    const doc = await client.getSingle("intro_page");

    const intro = {
      headline: doc.data.hero_headline,
      journeyText: doc.data.journey_cta_text,

      questions: doc.data.question_buttons.map((item) => item.label),

      cookie: {
        title: doc.data.cookie_title,
        description: doc.data.cookie_description,
        acceptText: doc.data.cookie_accept_text,
      },
    };

    res.render("pages/intro", {
      title: "Intro",
      intro,
      prismic: prismicH,
      isHome: true 
    });
  } catch (err) {
    console.error("Prismic error:", err);
    res.status(500).send("CMS Error");
  }
});

module.exports = router;
