const express = require("express");
const router = express.Router();
const { client } = require("../prismic"); // adjust path if needed

router.get("/work", async (req, res) => {
  try {
    const workItems = await client.getAllByType("work_item");

    res.render("pages/work", {
      title: "Work",
      showFooter: true,
      workItems
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
