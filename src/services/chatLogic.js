// services/chatLogic.js

/**
 * 1️⃣ INTENT CLASSIFIER
 * - Button matches first
 * - Keywords second
 * - Garbage last
 */
function classifyMessage(text) {
    const msg = text.toLowerCase().trim();
    console.log(msg,'----------this is test')

  // 🔴 EXACT button matches (highest priority)
  if (msg === "do you believe in aliens?") return "alien_fun";
  if (msg === "i need to talk to the manager") return "cta_team";
  if (msg === "can’t i just scroll?" || msg === "can't i just scroll?") return "scroll_meta";
  if (msg === "no, tks") return "soft_exit";
  if (msg === "just surprise me") return "surprise";
  if (msg === "typing is a pain") return "lazy_user";
  if (msg === "extra cheese") return "extra";

  // 🟡 Keyword-based (fallback)
  if (msg.includes("alien")) return "alien_fun";
  if (msg.includes("manager")) return "cta_team";
  if (msg.includes("work") || msg.includes("portfolio")) return "cta_work";
  if (msg.includes("about")) return "cta_team";

  // ⚫ Garbage / nonsense
  if (msg.length < 2) return "nonsense";


  return "generic";
}

/**
 * 2️⃣ MEANINGFUL GATE
 */
function isMeaningful(intent) {
  return !["nonsense"].includes(intent);
}

/**
 * 3️⃣ MEMEIC CTA LABELS
 */
const MEMEIC_LABELS = [
  "Witness",
  "Manifest This",
  "Enter The Void",
  "Chaos Mode",
  "Ascend",
  "Bet",
  "No Cap",
  "Gas",
  "Real Talk",
  "Stay Mad",
  "Based",
  "Understandable",
  "Aight",
  "Cook",
  "Say Less",
  "Vibe Check",
  "Main Character Energy"
];

function getRandomMemeicLabel() {
  return MEMEIC_LABELS[Math.floor(Math.random() * MEMEIC_LABELS.length)];
}

/**
 * 4️⃣ RANDOM AD (fetch from Prismic list)
 */
function getRandomAd(adsList = [], targetRoute = "#") {
  if (adsList && adsList.length > 0) {
    const randomAd = adsList[Math.floor(Math.random() * adsList.length)];
    return {
      image: randomAd.data.fake_ad?.url || "/images/ads/ad-1.webp",
      route: targetRoute
    };
  }

  const ads = [
    {
      image: "/images/ads/ad-1.webp",
      route: "/work"
    },
    {
      image: "/images/ads/ad-2.webp",
      route: "/portfolio"
    },
    {
      image: "/images/ads/ad-3.webp",
      route: "/open-studio"
    }
  ];

  return ads[Math.floor(Math.random() * ads.length)];
}

/**
 * 4️⃣ RESPONSE BUILDER
 * - Always returns a normalized shape
 */
function buildResponse(intent, adsList = [], targetRoute = "#", suggestedQuestions = []) {
  // 🧨 NON-MEANINGFUL → MEME
  if (!isMeaningful(intent)) {
    return {
      type: "meme",
      meme: {
        image: "/images/adults-image.png",
        caption: "I have no idea what that means, but I support you."
      }
    };
  }

  // ✅ MEANINGFUL → TEXT / CTA + AD
  let response = {
    type: "text",
    message: "",
    primaryCta: null,
    ad: getRandomAd(adsList, targetRoute),
    nextPrompts: []
  };

  switch (intent) {
    case "alien_fun":
      response.message =
        "Aliens? Undecided. But our work? 100% not from this planet 👽";
      response.nextPrompts = [
        "Show me your work",
        "Who even are you?",
        "Just surprise me"
      ];
      break;

    case "scroll_meta":
      response.message =
        "You *could* scroll… but where’s the drama in that?";
      response.nextPrompts = [
        "Show me something cool",
        "I need to talk to the manager"
      ];
      break;

    case "soft_exit":
      response.message =
        "Cold. Efficient. Emotionally unavailable. Respect.";
      response.nextPrompts = [
        "Actually wait",
        "Just surprise me"
      ];
      break;

    case "surprise":
      response.message =
        "Alright. Dealer’s choice.";
      response.primaryCta = {
        label: "Show me something cool",
        route: "/work"
      };
      response.nextPrompts = [
        "Another surprise",
        "Who even are you?"
      ];
      break;

    case "lazy_user":
      return {
        type: "meme",
        meme: {
          image: "/images/memes/typing-is-hard.gif",
          caption: "Say less."
        }
      };

    case "cta_team":
      response.message =
        "Bold move. The manager lives here.";
      response.primaryCta = {
        label: "Meet the team",
        route: "/about"
      };
      response.nextPrompts = [
        "What do you actually do?",
        "Show me your work"
      ];
      break;

    case "cta_work":
      response.message =
        "This is where we flex (politely).";
      response.primaryCta = {
        label: "View our work",
        route: "/work"
      };
      response.nextPrompts = [
        "Show me branding",
        "Show me web projects"
      ];
      break;

    default:
      response.message =
        "Interesting choice of words. Go on…";
      response.nextPrompts = [
        "Just surprise me",
        "Show me your work"
      ];
  }

  // Final override with Prismic questions if available
  // This ensures that even specific intents respect the Prismic source
  if (suggestedQuestions && suggestedQuestions.length > 0) {
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    response.nextPrompts = shuffled.slice(0, 3).map(q => {
      // Priority: Rich Text field 'question' -> Key Text field 'question' -> fallback
      return q.data?.question?.[0]?.text || q.data?.question || "What else?";
    });
  }

  return response;
}

module.exports = {
  classifyMessage,
  buildResponse,
  getRandomMemeicLabel
};
