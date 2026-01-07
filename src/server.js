const express = require("express");
const path = require("path");

const menuMiddleware = require("./middleware/menu");

const introRoute = require("./routes/index");
const mythJourneyRoute = require("./routes/mythJourney");
const loadingRoute = require("./routes/loading");
const mythCreationRoute = require("./routes/mythCreation");
const aboutRoute = require("./routes/about");
const workRoutes = require("./routes/work");
const openStudioRoutes = require("./routes/openStudio");
const portfolioRoutes = require("./routes/portfolio");
const termsRoutes = require("./routes/terms");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(menuMiddleware);

app.use("/", introRoute);
app.use("/myth-journey", mythJourneyRoute);
app.use("/", loadingRoute);
app.use("/myth-creation", mythCreationRoute);
app.use("/about-us", aboutRoute);
app.use("/", workRoutes);
app.use("/", openStudioRoutes);
app.use("/", portfolioRoutes);
app.use("/", termsRoutes);

// ✅ Static 404 — MUST be last
app.use((req, res) => {
  res.status(404).render("pages/404", {
    isHome: false,
    showFooter: false
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
