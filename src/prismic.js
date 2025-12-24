// prismic.js
require("dotenv").config();
const prismic = require("@prismicio/client");

const client = prismic.createClient("https://redarrow-website.cdn.prismic.io/api/v2", {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

module.exports = { client };
