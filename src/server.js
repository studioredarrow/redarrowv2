const express = require("express");
const path = require("path");

const introRoute = require("./routes/index");
const mythJourneyRoute = require("./routes/mythJourney");
const loadingRoute = require("./routes/loading");
const mythCreationRoute = require("./routes/mythCreation");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", introRoute);
app.use("/", mythJourneyRoute);
app.use("/", loadingRoute);
app.use("/myth-creation", mythCreationRoute);

// ✅ Static 404 — MUST be last
app.use((req, res) => {
  res.status(404).render("pages/404", {
    isHome: false,
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
