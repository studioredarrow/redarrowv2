const { classifyMessage, buildResponse, getRandomMemeicLabel } = require("./chatLogic");
const { askQwen } = require("../lib/qwen");

async function handleUserMessage(text, menuItems = [], adsList = [], suggestedQuestions = []) {
  const intent = classifyMessage(text);
  const msgLower = text.toLowerCase().trim();

  // 1️⃣ Check for Prismic Suggested Question Match
  let prismicAnswer = null;
  if (suggestedQuestions && suggestedQuestions.length > 0) {
    const match = suggestedQuestions.find(q => {
      const qText = (q.data?.question?.[0]?.text || q.data?.question || "").toLowerCase().trim();
      return qText === msgLower;
    });
    if (match) {
        // Assume the field in Prismic is called 'answer' based on user request
        prismicAnswer = match.data?.answer?.[0]?.text || match.data?.answer || null;
    }
  }

  // 2️⃣ Absolute garbage (if no Prismic match)
  if (!prismicAnswer && intent === "nonsense") {
    return buildResponse("nonsense", adsList, "#", suggestedQuestions);
  }

  // 3️⃣ Deterministic Intents (if no Prismic match)
  const deterministicIntents = ["cta_work", "cta_team"];
  if (!prismicAnswer && deterministicIntents.includes(intent)) {
    return buildResponse(intent, adsList, "#", suggestedQuestions);
  }

  // 4️⃣ AI or Prismic Answer Processing
  let aiResult = null;
  if (!prismicAnswer) {
    aiResult = await askQwen(text);
    if (!aiResult || aiResult.trim() === "" || aiResult.includes("NONSENSE")) {
      return buildResponse("nonsense", adsList, "#", suggestedQuestions);
    }
  }

  // Determine random routes for components
  let adRoute = "#";
  let ctaRoute = "#";
  
  if (menuItems && menuItems.length > 0) {
    const validItems = menuItems.filter(item => item.data?.route?.[0]?.text);
    if (validItems.length > 0) {
      adRoute = validItems[Math.floor(Math.random() * validItems.length)].data.route[0].text;
      ctaRoute = validItems[Math.floor(Math.random() * validItems.length)].data.route[0].text;
    }
  }

  // 5️⃣ Consolidate Response
  const response = buildResponse(intent, adsList, adRoute, suggestedQuestions);
  response.message = prismicAnswer || aiResult;

  // 6️⃣ Inject Dynamic Button
  if (ctaRoute !== "#") {
      response.primaryCta = {
          label: getRandomMemeicLabel(),
          route: ctaRoute
      };
  }

  return response;
}


module.exports = { handleUserMessage };
