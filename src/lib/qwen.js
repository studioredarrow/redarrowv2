// src/lib/qwen.js
const axios = require("axios");

const QWEN_LOCAL_URL = "http://127.0.0.1:8080/completion";

async function askQwen(userInput) {
    console.log('coming to qwen---',userInput)
  const prompt = `
You are a witty, concise website assistant.
Reply in one short paragraph.

User: ${userInput}
Assistant:
`;

  try {
    const response = await axios.post(QWEN_LOCAL_URL, {
      prompt,
      n_predict: 80,
      temperature: 0.7,
      top_p: 0.9,
      stop: ["User:"]
    });
    console.log(response,"---------AI RESPONSE---------")
    // llama-server returns text in "content"
    return response.data.content?.trim();
  } catch (error) {
    console.error("Qwen local error:", error.message);
    return null;
  }
}

module.exports = { askQwen };
