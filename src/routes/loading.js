const express = require("express");
const router = express.Router();
const { client } = require("../prismic");

router.get("/loading", async (req, res) => {
  try {
    const doc = await client.getSingle("loading_page");

    const loading = {
      title: doc.data.title,
      description: doc.data.description,
    };

    res.render("pages/loading", {
      title: "Loading",
      loading,
      isHome: false,
      showFooter: false
    });
  } catch (err) {
    console.error("Prismic loading page error:", err);
    res.status(500).send("CMS Error");
  }
});

module.exports = router;
