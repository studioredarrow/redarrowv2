const { client } = require("../prismic");

async function menuMiddleware(req, res, next) {

  try {
    const menuItems = await client.getAllByType("menu_page");

    // Sort menu items by the order field from Prismic
    menuItems.sort((a, b) => {
      const orderA = a.data?.order || 999;
      const orderB = b.data?.order || 999;
      return orderA - orderB;
    });

    res.locals.menuItems = menuItems;
  } catch (err) {
    console.error("❌ FAILED TO FETCH MENU");
    console.error(err);
    res.locals.menuItems = [];
  }

  next();
}

module.exports = menuMiddleware;
