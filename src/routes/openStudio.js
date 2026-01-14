const express = require("express");
const router = express.Router();
const { client } = require("../prismic");

router.get("/open-studio", async (req, res, next) => {
  try {
    const workItems = await client.getAllByType("work_item");

    const [studioImages] = await client.getAllByType("open_studio_images");
    // 👆 expecting ONE document

    res.render("pages/open-studio", {
      title: "Open Studio",
      showFooter: true,
      workItems,
      studioImages
    });
  } catch (err) {
    console.error("❌ Open Studio error:", err);
    next(err);
  }
});

module.exports = router;
