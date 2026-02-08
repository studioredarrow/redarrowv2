const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

/**
 * Helper to safely fetch by UID
 */
async function getByUIDSafe(type, slug) {
  try {
    return await client.getByUID(type, slug);
  } catch (err) {
    return null;
  }
}

/**
 * Shared handler for Portfolio & Open Studio
 */
router.get(
  ["/portfolio/:slug", "/open-studio/:slug"],
  async (req, res) => {
    try {
      const { slug } = req.params;

      // Decide primary custom type based on URL
      const primaryType = req.path.startsWith("/open-studio")
        ? "openstudio_items"
        : "portfolio_items";

      console.log("\n===============================");
      console.log("🔍 Slug:", slug);
      console.log("📂 Primary Type:", primaryType);
      console.log("===============================\n");

      // Try primary → fallback to work_item
      let portfolioItem =
        (await getByUIDSafe(primaryType, slug)) ||
        (await getByUIDSafe("work_item", slug));

      if (!portfolioItem) {
        throw new Error(`Item with slug "${slug}" not found`);
      }

      /* =============================
         🔎 ADDITIONAL SECTION DEBUG
      ============================== */

      const additionalSections =
        portfolioItem.data?.additional_photo_sections || [];

      console.log(
        "📦 additional_photo_sections length:",
        additionalSections.length
      );

      additionalSections.forEach((section, index) => {
        console.log(`\n🧩 Section #${index + 1}`);
        console.log("Layout:", section.section_layout);
        console.log("Title:", section.section_title || "(no title)");
        console.log("Images present:", {
          img1: !!section.section_image_1?.url,
          img2: !!section.section_image_2?.url,
          img3: !!section.section_image_3?.url,
          img4: !!section.section_image_4?.url,
          img5: !!section.section_image_5?.url,
          img6: !!section.section_image_6?.url
        });
      });

      /* =============================
         🎯 RENDER
      ============================== */

      res.render("pages/portfolio", {
        title:
          portfolioItem.data.hero_title ||
          portfolioItem.data.title ||
          "Portfolio",
        portfolioItem,
        additional_photo_sections: additionalSections,
        pageType: primaryType, // optional, future-proof
        showFooter: true,
        hideCreateOuter: true,
        asHTML: prismicH.asHTML,
        asText: prismicH.asText
      });

    } catch (err) {
      console.error("\n❌ Page error:", err.message);

      res.status(404).render("pages/404", {
        title: "Page Not Found",
        showFooter: true
      });
    }
  }
);

module.exports = router;
