const express = require("express");
const router = express.Router();
const { client } = require("../prismic"); // make sure this path is correct

router.get("/", async (req, res) => {
  let page = null;

  try {
    // Try fetching Prismic content
    page = await client.getSingle("myth_creation_page");
  } catch (error) {
    console.error("❌ Prismic fetch failed (Myth Creation):", error.message);
  }
  console.log(page);
  // Always render the page (no crash)
  res.render("pages/mythCreation", {
    title: page?.data?.hero_title || "Myth Creation",
    page: page || { data: {} },   // <-- prevents Pug undefined errors
    showFooter: true,
    hideCreateOuter: true
  });
});

module.exports = router;
