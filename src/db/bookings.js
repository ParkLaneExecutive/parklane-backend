const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../data/bookings.json");

exports.readBookings = () => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

exports.writeBookings = (bookings) => {
  fs.writeFileSync(file, JSON.stringify(bookings, null, 2));
};
