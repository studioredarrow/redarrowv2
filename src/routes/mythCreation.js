const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/", async (req, res) => {
  let pageData = {};

  try {
    const page = await client.getSingle("myth_creation_page");
    pageData = page?.data || {};
  } catch (error) {
    console.error("❌ Prismic fetch failed (Myth Creation):", error.message);
  }

  res.render("pages/mythCreation", {
    title: pageData.hero_title || "Myth Creation",
    page: pageData,              // 👈 pass only data, not full doc
    showFooter: true,
    asHTML: prismicH.asHTML,
  });
});

module.exports = router;
