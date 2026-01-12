const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

router.get("/", async (req, res) => {
  try {
    const page = await client.getSingle("about_page");

    const teamMembers = await client.getAllByType("team_member", {
      orderings: {
        field: "document.first_publication_date",
        direction: "asc"
      }
    });

    const availableSlots = await client.getAllByType("available_slot");

    res.render("pages/about", {
      page,
      teamMembers,
      availableSlots,
      title: "About Us | Red Arrow",
      showFooter: true,
      asText: prismicH.asText,
      asHTML: prismicH.asHTML
    });
  } catch (err) {
    console.error("❌ About page fetch error:", err);
    res.status(500).send("Page error");
  }
});

module.exports = router;
