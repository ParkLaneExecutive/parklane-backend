const { readBookings, writeBookings } = require("../db/bookings");
const { readUsers } = require("../db/users");

// ADMIN LOGIN
exports.adminLogin = (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_SECRET_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }

  const token = require("jsonwebtoken").sign(
    { id: "admin", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};

// GET ALL BOOKINGS
exports.getAllBookings = (req, res) => {
  res.json({ bookings: readBookings() });
};

// GET SINGLE BOOKING
exports.getBookingById = (req, res) => {
  const booking = readBookings().find((b) => b.id === req.params.id);

  if (!booking) return res.status(404).json({ message: "Not found" });

  res.json({ booking });
};

// UPDATE STATUS
exports.updateBookingStatus = (req, res) => {
  const bookings = readBookings();
  const booking = bookings.find((b) => b.id === req.params.id);

  if (!booking) return res.status(404).json({ message: "Not found" });

  booking.status = req.body.status || booking.status;

  writeBookings(bookings);

  res.json({ booking });
};

