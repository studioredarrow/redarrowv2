const express = require("express");
const path = require("path");

const introRoute = require("./routes/index");
const mythJourneyRoute = require("./routes/mythJourney");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", introRoute);
app.use("/", mythJourneyRoute);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
