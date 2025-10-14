const router = require("express").Router(),
  User = require("../schemas/userSchema"),
  fs = require("fs"),
  path = require("path");

router.get("/new", (req, res) => {
  res.render("track", { error: false });
});

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

router.post("/new", async (req, res) => {
  try {
    const { crop, quantity, harvestName } = req.body;
    if (!crop || !harvestName || !quantity)
      return res.render("track", { error: "Please enter all the details!" });
    const foundUser = await User.findOne({ email: req.user.email });
    const currentCrops = foundUser.crops;
    for (let i = 0; i < foundUser.crops.length; i++) {
      if (foundUser.crops[i].name == crop) {
        return res.render("track", { error: "Already tracking this crop!" });
      }
    }
    const mspPrices = getMSPPrices(crop);
    currentCrops.push({
      name: crop,
      harvest: 0,
      date: Number(new Date()),
      mspPrices: mspPrices,
    });

    await User.updateOne(
      { email: req.user.email },
      {
        $set: {
          crops: currentCrops,
        },
      }
    );
    res.redirect(`/`);
  } catch (error) {
    res.json({ success: false });
  }
});

router.get("/harvest", async (req, res) => {
  const foundUser = await User.findOne({ email: req.user.email });
  const currentCrops = [];
  for (let i = 0; i < foundUser.crops.length; i++) {
    currentCrops.push(foundUser.crops[i].name);
  }
  res.render("harvest", { crops: currentCrops, error: false });
});

router.post("/harvest", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.user.email });
    const currentCrops = [];
    for (let j = 0; j < foundUser.crops.length; j++) {
      currentCrops.push(foundUser.crops[j].name);
    }
    const currentCropsFull = foundUser.crops;
    const pointsConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "pointsConfig.json"), {
        encoding: "utf8",
      })
    );
    const { crop, quantity } = req.body;
    if (!crop || !quantity)
      return res.render("harvest", {
        crops: currentCrops,
        error: "Please enter all the values!",
      });
    var totalPoints = 0;
    for (let i = 0; i < pointsConfig.length; i++) {
      if (pointsConfig[i].crop == crop) {
        const currentCrop = pointsConfig[i];
        if (req.user.landSize < 1) {
          totalPoints += 50;
        } else if (req.user.landSize >= 1 && req.user.landSize < 2) {
          totalPoints += 40;
        } else if (req.user.landSize >= 2 && req.user.landSize < 4) {
          totalPoints += 30;
        } else if (req.user.landSize >= 4 && req.user.landSize < 10) {
          totalPoints += 20;
        } else {
          totalPoints += 10;
        }
        if (req.user.age < 30) {
          totalPoints += 10;
        } else if (req.user.age >= 30 && req.user.age < 45) {
          totalPoints += 20;
        } else {
          totalPoints += 30;
        }
        if (quantity < 500) {
          totalPoints += 4;
        } else if (quantity < 1000) {
          totalPoints += 10;
        } else if (quantity < 2500) {
          totalPoints += 20;
        } else if (quantity < 4000) {
          totalPoints += 30;
        } else if (quantity < 5000) {
          totalPoints += 40;
        } else {
          totalPoints += 50;
        }
        if (currentCrop.points) {
          totalPoints += currentCrop.points;
        }
        totalPoints += foundUser.points;
        var loyaltyLevel;
        if (totalPoints < 500) {
          loyaltyLevel = "Bronze";
        } else if (totalPoints < 1500) {
          loyaltyLevel = "Silver";
        } else if (totalPoints < 3000) {
          loyaltyLevel = "Gold";
        } else {
          loyaltyLevel = "Platinum";
        }
        await User.updateOne(
          { email: req.user.email },
          {
            $set: {
              points: totalPoints,
              loyaltyLevel: loyaltyLevel,
              production: foundUser.production + Number(quantity),
              money: foundUser.money + pointsConfig[i].price * Number(quantity),
            },
          }
        );
        return res.redirect("/");
      }
    }
    res.render("harvest", {
      crops: currentCrops,
      error: "Something went wrong. Please try again.",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/crop/harvest");
  }
});

router.post("/getEstimatedPrice", async (req, res) => {
  const pointsConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "pointsConfig.json"), {
      encoding: "utf8",
    })
  );
  const { crop, quantity } = req.body;
  for (let i = 0; i < pointsConfig.length; i++) {
    if (pointsConfig[i].crop == crop) {
      var totalPrice = pointsConfig[i].price * quantity;
      return res.json({ price: totalPrice.toString() });
    }
  }
  return res.json({ price: "0" });
});

module.exports = router;
