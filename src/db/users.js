const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../data/users.json");

exports.readUsers = () => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

exports.writeUsers = (users) => {
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
};
