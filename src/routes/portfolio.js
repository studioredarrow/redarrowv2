const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

/**
 * Helper to safely fetch by UID
 * @param {string} type - Document type
 * @param {string} slug - UID slug
 * @param {object} [options] - Optional fetch options (e.g. fetchLinks)
 */
async function getByUIDSafe(type, slug, options = {}) {
  try {
    return await client.getByUID(type, slug, options);
  } catch (err) {
    return null;
  }
}

/** Fetch options to resolve related work_item and openstudio_items with full data (images, titles) */
const relatedProjectsFetchLinks = [
  "work_item.thumbnail",
  "work_item.title",
  "work_item.short_description",
  "openstudio_items.hero_banner_image",
  "openstudio_items.hero_title",
  "openstudio_items.title",
  "openstudio_items.artist_name"
];

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

      // Try primary → fallback to work_item (fetchLinks resolves related work_items with thumbnail, title)
      const fetchOpts = { fetchLinks: relatedProjectsFetchLinks };
      let portfolioItem =
        (await getByUIDSafe(primaryType, slug, fetchOpts)) ||
        (await getByUIDSafe("work_item", slug, fetchOpts));

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
         📎 RELATED PROJECTS (Prismic output)
      ============================== */
      const relatedProjects = portfolioItem.data?.related_projects;
      console.log("\n📎 related_projects from Prismic:", JSON.stringify(relatedProjects, null, 2));

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
