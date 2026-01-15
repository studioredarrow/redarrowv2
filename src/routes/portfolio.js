const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/portfolio/:slug", async (req, res) => {
  try {
    let portfolioItem;
    const slug = req.params.slug;
    
    console.log("🔍 Looking for portfolio with slug:", slug);
    
    // Try portfolio_item first
    try {
      portfolioItem = await client.getByUID("portfolio_items", slug);
      console.log("✅ Found as portfolio_item");
    } catch (portfolioErr) {
      console.log("⚠️ Not found as portfolio_item, trying work_item...");
      // Fallback to work_item if portfolio_item doesn't exist
      try {
        portfolioItem = await client.getByUID("work_item", slug);
        console.log("✅ Found as work_item");
      } catch (workErr) {
        console.error("❌ Not found as work_item either");
        throw new Error(`Portfolio item with slug "${slug}" not found in either portfolio_item or work_item`);
      }
    }
    
    res.render("pages/portfolio", {
      title: portfolioItem.data.hero_title || portfolioItem.data.title || "Portfolio",
      portfolioItem,
      showFooter: true,
      hideCreateOuter: true,
      asHTML: prismicH.asHTML,
      asText: prismicH.asText
    });
  } catch (err) {
    console.error("❌ Portfolio error:", err.message);
    console.error("Full error:", err);
    res.status(404).render("pages/404", {
      title: "Portfolio Not Found",
      showFooter: true
    });
  }
});

module.exports = router;
