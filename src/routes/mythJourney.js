const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");
const { handleUserMessage } = require("../services/chatEngine");

router.get("/", async (req, res) => {
  try {
    const thinkingMessages = await client.getAllByType("thinking_message");

    const randomMessage =
      thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];

    // ✅ USE CORRECT FIELD NAME
    const thinkingTextHTML = prismicH.asHTML(
      randomMessage.data.thinking_text
    );

    res.render("pages/myth-journey", {
      thinkingText: thinkingTextHTML,
      thinkingImage: randomMessage.data.image?.url,
    });
  } catch (error) {
    console.error("Prismic error:", error);

    res.render("pages/myth-journey", {
      thinkingText: "<p>Pretending to think very hard 🤖...</p>",
      thinkingImage: "/images/loding-banner-image.png",
    });
  }
});

/**
 * CHAT API (MOCK)
 */
router.post("/chat", express.json(), async (req, res) => {
  const userMessage = req.body.message;
  console.log(userMessage,'-----test')
  const response = await handleUserMessage(userMessage);

  res.json(response);
});




module.exports = router;
