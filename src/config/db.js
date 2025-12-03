// No real database. Using JSON files instead.
const connectDB = async () => {
  console.log("Using local JSON database (no MongoDB).");
};

module.exports = connectDB;
