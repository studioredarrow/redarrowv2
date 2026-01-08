const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/", async (req, res) => {
  try {
    const page = await client.getSingle("about_page"); 
    // ⬆️ use your actual custom type ID
    console.log(page)
    res.render("pages/about", {
      page,
      title: "About Us | Red Arrow",
      showFooter: true,
      asText: prismicH.asText,
      asHTML: prismicH.asHTML // optional, but useful later
    });
  } catch (err) {
    console.error("❌ Open Studio fetch error:", err);
    res.status(500).send("Page error");
  }
});

module.exports = router;
