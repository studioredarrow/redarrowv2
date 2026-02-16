const { client } = require("../prismic");

async function suggestedQuestionsMiddleware(req, res, next) {
  try {
    const questions = await client.getAllByType("suggested_question");
    res.locals.suggestedQuestions = questions || [];
  } catch (err) {
    console.error("❌ FAILED TO FETCH SUGGESTED QUESTIONS");
    console.error(err);
    res.locals.suggestedQuestions = [];
  }
  next();
}

module.exports = suggestedQuestionsMiddleware;
