const express = require("express");
const router = express.Router();
const {
  getQuote,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { auth } = require("../middleware/auth");

router.post("/quote", auth, getQuote);
router.post("/", createBooking);
router.get("/", getMyBookings);
router.get("/:id", auth, getBookingById);
router.post("/", createBooking);

module.exports = router;
