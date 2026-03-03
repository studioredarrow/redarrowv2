const express = require("express");
const router = express.Router();
const { client } = require("../prismic"); // adjust path if needed

router.get("/work", async (req, res) => {
  try {
    const workItems = await client.getAllByType("work_item");

    // Calculate counts (supports category_group with multiple categories per item)
    const counts = {};
    workItems.forEach(item => {
      const group = item.data.category_group || [];
      const cats = group.length > 0
        ? group.map((e) => (e.category || "").toLowerCase()).filter(Boolean)
        : [(item.data.category || "other").toLowerCase()]; // fallback for old single category
      cats.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });

    res.render("pages/work", {
      title: "Work",
      showFooter: true,
      workItems,
      counts
    });
  } catch (err) {
    console.error("Error fetching work items:", err);
    res.render("pages/work", {
      title: "Work",
      showFooter: true,
      workItems: []
    });
  }
});

module.exports = router;
