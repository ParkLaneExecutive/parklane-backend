const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { tier, passengers, luggage } = req.body;

  if (!tier || !passengers) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const base =
    tier === "Business" ? 85 :
    tier === "First" ? 140 :
    110;

  const add =
    Math.min(passengers - 1, 4) * 8 +
    Math.min(luggage || 0, 6) * 3;

  const quote = base + add;

  res.json({ quote });
});

module.exports = router;
