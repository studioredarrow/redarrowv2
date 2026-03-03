const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/terms-and-conditions", async (req, res) => {
  try {
    const terms = await client.getSingle("terms__conditions");

    res.render("pages/terms", {
      title: terms.data.page_title,
      terms,
      showFooter: true,
      hideCreateOuter: true,
      asHTML: prismicH.asHTML
    });
  } catch (error) {
    console.error("❌ Terms page error:", error);
    res.status(500).send("Terms page not found");
  }
});

module.exports = router;

