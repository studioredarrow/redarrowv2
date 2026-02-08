const express = require("express");
const router = express.Router();
const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");
const { handleUserMessage } = require("../services/chatEngine");

router.get("/", async (req, res) => {
  try {
    const thinkingMessages = await client.getAllByType("thinking_message");

    const filtered = thinkingMessages.filter(msg =>
        msg.data.context === "generic" ||
        msg.data.context === "page_load"
      );

    const randomMessage =
      filtered[Math.floor(Math.random() * filtered.length)];

    // ✅ USE CORRECT FIELD NAME
    const thinkingTextHTML = prismicH.asHTML(
      randomMessage.data.thinking_text
    );
    const questions = await client.getAllByType("suggested_question");

    // shuffle + pick 4
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 4).map(q => ({
      question: q.data.question?.[0]?.text || "",
      textResponse: q.data.text__response?.[0]?.text || "",
      memeResponse: q.data.meme_response?.url || null,
      ctaTo: q.data.cta_to || null
    }));


    res.render("pages/myth-journey", {
      thinkingText: thinkingTextHTML,
      thinkingImage: randomMessage.data.image?.url,
      questions: selectedQuestions,
      showFooter: false
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

router.get("/thinking/:context", async (req, res) => {
  try {
    const { context } = req.params;

    const messages = await client.getAllByType("thinking_message");

    const filtered = messages.filter(msg =>
      msg.data.context === "generic" ||
      msg.data.context === context
    );

    if (!filtered.length) {
      return res.json(null);
    }

    const random =
      filtered[Math.floor(Math.random() * filtered.length)];

    res.json({
      text: prismicH.asHTML(random.data.thinking_text),
      image: random.data.image?.url || null,
    });
  } catch (err) {
    console.error("Thinking message error", err);
    res.json(null);
  }
});



module.exports = router;
