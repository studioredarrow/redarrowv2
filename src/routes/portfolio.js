const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/portfolio/:slug", async (req, res) => {
  try {
    let portfolioItem;
    const slug = req.params.slug;

    console.log("\n===============================");
    console.log("🔍 Looking for portfolio with slug:", slug);
    console.log("===============================\n");

    // Try portfolio_item first
    try {
      portfolioItem = await client.getByUID("portfolio_items", slug);
      console.log("✅ Found as portfolio_items");
    } catch (portfolioErr) {
      console.log("⚠️ Not found as portfolio_items, trying work_item...");
      try {
        portfolioItem = await client.getByUID("work_item", slug);
        console.log("✅ Found as work_item");
      } catch (workErr) {
        console.error("❌ Not found as work_item either");
        throw new Error(`Portfolio item with slug "${slug}" not found`);
      }
    }

    /* =============================
       🔎 ADDITIONAL SECTION DEBUG
    ============================== */

    const additionalSections =
      portfolioItem?.data?.additional_photo_sections;

    console.log("📦 additional_photo_sections exists:",
      !!additionalSections
    );

    if (additionalSections) {
      console.log(
        "📊 additional_photo_sections length:",
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
    } else {
      console.warn("⚠️ additional_photo_sections is UNDEFINED in Prismic data");
    }

    /* =============================
       🎯 RENDER
    ============================== */

    res.render("pages/portfolio", {
      title: portfolioItem.data.hero_title || portfolioItem.data.title || "Portfolio",
      portfolioItem,
      additional_photo_sections: additionalSections || [],
      showFooter: true,
      hideCreateOuter: true,
      asHTML: prismicH.asHTML,
      asText: prismicH.asText
    });

  } catch (err) {
    console.error("\n❌ Portfolio error:", err.message);
    console.error("Full error:", err);

    res.status(404).render("pages/404", {
      title: "Portfolio Not Found",
      showFooter: true
    });
  }
});


module.exports = router;
