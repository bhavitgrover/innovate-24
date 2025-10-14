const router = require("express").Router();

function getMSPPrices(crop) {
  switch (crop) {
    case "paddy":
      return [2369, 2410];
    case "maize":
      return [2225, 2250];
    case "wheat":
      return [2425, 2585];
    case "barley":
      return [1980, 2150];
    case "bajra":
      return [2625, 2775];
    case "jowar":
      return [3371, 3621];
    case "ragi":
      return [4290, 4886];
    case "soyabeen":
      return [4892, 5020];
    case "gram":
      return [5650, 5875];
    case "jute":
      return [5400, 5550];
    case "groundnut":
      return [6783, 7019];
    case "masur":
      return [6700, 7000];
    case "rapeseed":
      return [5950, 6200];
    case "mustard":
      return [5450, 5700];
    case "safflower":
      return [5940, 6540];
    case "tur":
      return [7550, 7850];
    case "sunflower":
      return [7280, 7710];
    case "urad":
      return [7400, 7640];
    case "cotton":
      return [6620, 7209];
    case "nigerseed":
      return [7287, 8107];
    case "moong":
      return [8682, 9000];
    case "sesamium":
      return [8845, 9424];
    case "copra":
      return [11582, 12100];
    default:
      return [null, null];
  }
}

router.get("/", (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("harvest-prices", { user: req.user });
});

module.exports = router;
