const express = require("express");
const router = express.Router();
const { adminLogin, getAllBookings, getBookingById, updateBookingStatus } =
  require("../controllers/adminController");

const { auth, requireRole } = require("../middleware/auth");

// Admin login (no JWT required)
router.post("/login", adminLogin);

// All routes below require admin role
router.use(auth, requireRole("admin"));

router.get("/bookings", getAllBookings);
router.get("/bookings/:id", getBookingById);
router.patch("/bookings/:id", updateBookingStatus);

module.exports = router;
