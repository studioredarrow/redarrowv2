const { classifyMessage, buildResponse } = require("./chatLogic");
const { askQwen } = require("../lib/qwen");

async function handleUserMessage(text) {
  const intent = classifyMessage(text);
    console.log(intent)
  // 1️⃣ Absolute garbage → meme
  if (intent === "nonsense") {
    return buildResponse("nonsense");
  }

  // 2️⃣ Fully deterministic (NO AI)
  const deterministicIntents = ["cta_work", "cta_team"];
  if (deterministicIntents.includes(intent)) {
    return buildResponse(intent);
  }

  // 3️⃣ AI-assisted intents
  const aiText = await askQwen(text);

  if (!aiText || aiText.trim() === "" || aiText.includes("NONSENSE")) {
    return buildResponse("nonsense");
  }

  // 4️⃣ Use AI text but keep structure
  const response = buildResponse(intent);
  response.message = aiText;

  return response;
}


module.exports = { handleUserMessage };
