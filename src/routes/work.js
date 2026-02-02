const express = require("express");
const router = express.Router();
const { client } = require("../prismic"); // adjust path if needed

router.get("/work", async (req, res) => {
  try {
    const workItems = await client.getAllByType("work_item");

    // Calculate counts
    const counts = {};
    workItems.forEach(item => {
      const cat = (item.data.category || "other").toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
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
