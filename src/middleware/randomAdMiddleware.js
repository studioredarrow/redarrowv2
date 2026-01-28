const { client } = require("../prismic");

async function randomAdMiddleware(req, res, next) {
  try {
    const ads = await client.getAllByType("random_ads");

    if (ads.length) {
      const randomIndex = Math.floor(Math.random() * ads.length);
      const randomAd = ads[randomIndex];

      res.locals.randomFooterAd =
        randomAd.data.fake_ad?.url || null;
    } else {
      res.locals.randomFooterAd = null;
    }

    next();
  } catch (err) {
    console.error("❌ Random Ad Fetch Error:", err);
    res.locals.randomFooterAd = null;
    next();
  }
}

module.exports = randomAdMiddleware;
