const { client } = require("../prismic");

async function menuMiddleware(req, res, next) {

  try {
    const menuItems = await client.getAllByType("menu_page");

    // menuItems.forEach((item, i) => {
    //   console.log(
    //     `#${i + 1}`,
    //     item.uid,
    //     item.data?.label,
    //     item.data?.route
    //   );
    // });

    res.locals.menuItems = menuItems;
  } catch (err) {
    console.error("❌ FAILED TO FETCH MENU");
    console.error(err);
    res.locals.menuItems = [];
  }

  next();
}

module.exports = menuMiddleware;
