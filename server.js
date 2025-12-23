// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// -------------------- Middleware --------------------
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

// -------------------- Health check --------------------
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// -------------------- QUOTE ENDPOINT --------------------
// POST /quote
// body: { tier: "Business" | "First" | "XL", passengers: number, luggage?: number }
app.post("/quote", (req, res) => {
  const { tier, passengers, luggage } = req.body || {};

  if (!tier || typeof passengers !== "number") {
    return res.status(400).json({
      error: "Missing fields",
      expected: {
        tier: "Business | First | XL",
        passengers: "number",
        luggage: "number (optional)",
      },
    });
  }

  const pax = Math.max(1, Math.min(6, passengers));
  const bags = Math.max(0, Math.min(8, typeof luggage === "number" ? luggage : 0));

  let base;
  if (tier === "Business") base = 85;
  else if (tier === "First") base = 140;
  else if (tier === "XL") base = 110;
  else {
    return res.status(400).json({
      error: "Invalid tier",
      allowed: ["Business", "First", "XL"],
    });
  }

  const add = Math.min(4, pax - 1) * 8 + Math.min(6, bags) * 3;
  const quote = base + add;

  res.json({ quote });
});

// -------------------- SIMPLE BOOKINGS STORE --------------------
// (File-based so you can test end-to-end without MongoDB)
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeBookings(data) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// POST /bookings
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

  if (
    !pickup ||
    !dropoff ||
    !date ||
    !time ||
    typeof passengers !== "number" ||
    typeof quote !== "number"
  ) {
    return res.status(400).json({
      error: "Missing or invalid fields",
    });
  }

  const booking = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
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

  const items = readBookings();
  items.unshift(booking);
  writeBookings(items);

  res.status(201).json({ id: booking.id, status: booking.status });
});

// GET /bookings (admin/testing)
app.get("/bookings", (_req, res) => {
  res.json({ items: readBookings() });
});

// -------------------- Start server --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Chauffeur backend running on http://localhost:${PORT}`);
});

