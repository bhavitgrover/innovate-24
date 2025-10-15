const router = require("express").Router();

router.get("/", async (req, res) => {
  const foundUser = req.user;
  if (!foundUser) return res.redirect("/login");
  const currentCrops = [];
  for (let i = 0; i < foundUser.crops.length; i++) {
    currentCrops.push(foundUser.crops[i].name);
  }
  res.render("events", { crops: currentCrops, error: false, user: req.user });
});

module.exports = router;
