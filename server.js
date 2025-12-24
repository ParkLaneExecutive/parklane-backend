require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PRICING = {
  currency: "GBP",
  minimumFare: { Business: 70, First: 120, XL: 95 },
  baseFee: { Business: 25, First: 40, XL: 32 },
  perKm: { Business: 2.4, First: 3.6, XL: 3.0 },
  perMin: { Business: 0.35, First: 0.55, XL: 0.45 },
  meetGreetFee: 12,
  airportPickupFee: 10,
  extraStopFee: 8,
  childSeatFee: 10,
};

function clampNumber(n, min, max, fallback) {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function roundGBP(n) {
  return Math.round(n);
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/quote", (req, res) => {
  const b = req.body || {};
  const tier = b.tier;

  if (!tier || !["Business", "First", "XL"].includes(tier)) {
    return res.status(400).json({ error: "Invalid tier", allowed: ["Business", "First", "XL"] });
  }

  const passengers = clampNumber(b.passengers, 1, 6, 1);
  const luggage = clampNumber(b.luggage, 0, 8, 0);

  const distanceKm = clampNumber(b.distanceKm, 1, 500, 12);
  const durationMin = clampNumber(b.durationMin, 5, 600, 25);
  const extraStops = clampNumber(b.extraStops, 0, 10, 0);
  const childSeats = clampNumber(b.childSeats, 0, 4, 0);
  const meetGreet = !!b.meetGreet;
  const airportPickup = !!b.airportPickup;

  const paxFactor = 1 + Math.max(0, passengers - 1) * 0.06;
  const bagFactor = 1 + Math.max(0, luggage - 1) * 0.03;

  const base = PRICING.baseFee[tier];
  const distancePart = distanceKm * PRICING.perKm[tier];
  const timePart = durationMin * PRICING.perMin[tier];

  const extras =
    (meetGreet ? PRICING.meetGreetFee : 0) +
    (airportPickup ? PRICING.airportPickupFee : 0) +
    extraStops * PRICING.extraStopFee +
    childSeats * PRICING.childSeatFee;

  const raw = base + distancePart + timePart + extras;
  const factored = raw * paxFactor * bagFactor;
  const minFare = PRICING.minimumFare[tier];
  const total = Math.max(minFare, factored);

  const quote = roundGBP(total);

  res.json({
    quote,
    currency: PRICING.currency,
    breakdown: {
      tier,
      passengers,
      luggage,
      base: roundGBP(base),
      distanceKm,
      distancePart: roundGBP(distancePart),
      durationMin,
      timePart: roundGBP(timePart),
      extras: roundGBP(extras),
      paxFactor: Number(paxFactor.toFixed(2)),
      bagFactor: Number(bagFactor.toFixed(2)),
      minimumFare: minFare,
      total: quote,
    },
  });
});

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

app.post("/bookings", (req, res) => {
  const b = req.body || {};
  const { pickup, dropoff, date, time, passengers, luggage, tier, quote, breakdown } = b;

  if (!pickup || !dropoff || !date || !time || typeof passengers !== "number" || typeof quote !== "number" || !tier) {
    return res.status(400).json({ error: "Missing or invalid fields" });
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
    breakdown: breakdown || null,
    status: "requested",
    createdAt: new Date().toISOString(),
  };

  const items = readBookings();
  items.unshift(booking);
  writeBookings(items);

  res.status(201).json({ id: booking.id, status: booking.status });
});

app.get("/bookings", (_req, res) => {
  res.json({ items: readBookings() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Chauffeur backend running on port ${PORT}`);
});

