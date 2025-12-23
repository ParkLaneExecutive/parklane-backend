// app.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// -------- Middleware --------
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

// -------- Health check --------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// -------- Quote endpoint (Blacklane-style fixed quote stub) --------
// POST /quote
// body: { tier: "Business"|"First"|"XL", passengers: number, luggage: number }
app.post("/quote", (req, res) => {
  const { tier, passengers, luggage } = req.body || {};

  if (!tier || typeof passengers !== "number") {
    return res.status(400).json({
      error: "Missing fields",
      expected: { tier: "Business|First|XL", passengers: "number", luggage: "number (optional)" },
    });
  }

  const pax = Math.max(1, Math.min(6, passengers));
  const bags = Math.max(0, Math.min(8, typeof luggage === "number" ? luggage : 0));

  const base =
    tier === "Business" ? 85 :
    tier === "First" ? 140 :
    tier === "XL" ? 110 :
    null;

  if (base == null) {
    return res.status(400).json({ error: "Invalid tier", allowed: ["Business", "First", "XL"] });
  }

  const add = Math.min(4, pax - 1) * 8 + Math.min(6, bags) * 3;
  const quote = base + add;

  res.json({ quote });
});

// -------- Simple file-backed bookings (optional, no DB needed) --------
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBookings(items) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(items, null, 2), "utf8");
}

// POST /bookings
// body: { pickup, dropoff, date, time, passengers, luggage, tier, quote }
app.post("/bookings", (req, res) => {
  const {
    pickup,
    dropoff,
    date,
    time,
    passengers,
    luggage,
    tier,
    quote,
  } = req.body || {};

  if (!pickup || !dropoff || !date || !time || typeof passengers !== "number" || typeof quote !== "number") {
    return res.status(400).json({
      error: "Missing/invalid fields",
      expected: {
        pickup: "string",
        dropoff: "string",
        date: "YYYY-MM-DD",
        time: "HH:MM",
        passengers: "number",
        luggage: "number (optional)",
        tier: "Business|First|XL",
        quote: "number",
      },
    });
  }

  const items = readBookings();
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const booking = {
    id,
    pickup,
    dropoff,
    date,
    time,
    passengers,
    luggage: typeof luggage === "number" ? luggage : 0,
    tier,
    quote,
    status: "requested",
    createdAt: new Date().toISOString(),
  };

  items.unshift(booking);
  writeBookings(items);

  res.status(201).json({ id: booking.id, status: booking.status });
});

// GET /bookings (for quick testing)
app.get("/bookings", (req, res) => {
  res.json({ items: readBookings() });
});

// -------- Start server --------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

module.exports = app;
