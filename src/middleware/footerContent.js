const { client } = require("../prismic");
const prismicH = require("@prismicio/helpers");

// Read a Prismic field as plain text, whether it's a Key Text (plain string)
// or a Rich Text field (array of blocks).
function fieldToText(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  try {
    return prismicH.asText(field) || "";
  } catch (e) {
    return "";
  }
}

// Convert a Prismic text field into a single HTML string where each line
// becomes a <br>-separated line — matching the footer's existing markup.
function toBrHtml(field) {
  const text = fieldToText(field).trim();
  if (!text) return null;
  return text
    .split(/\r?\n/)
    .map(line =>
      line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    )
    .join("<br>");
}

// Exposes the footer "Create Chaos" texts from Prismic (single type: "footer").
// Falls back to null (template keeps its static text) if the document/fields
// are not present yet.
async function footerContentMiddleware(req, res, next) {
  try {
    const footer = await client.getSingle("footer");
    res.locals.footerCreateHeading = fieldToText(footer.data.create_heading).trim() || null;
    res.locals.footerCreateText1 = toBrHtml(footer.data.create_text_1);
    res.locals.footerCreateText2 = toBrHtml(footer.data.create_text_2);
  } catch (err) {
    res.locals.footerCreateHeading = null;
    res.locals.footerCreateText1 = null;
    res.locals.footerCreateText2 = null;
  }
  next();
}

module.exports = footerContentMiddleware;
