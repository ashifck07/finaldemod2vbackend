
const express = require("express");
const {checkFirebaseConnection} = require("./config/firebase");
const architectRoutes = require("./routes/architectRoutes");
const leadRoutes = require("./routes/leadRoutes");
const designRoutes = require("./routes/designRoutes");
const activityLogRoutes = require("./routes/activitylogRoute");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoute");

require("dotenv").config();

const app = express();
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({extended: true})); // Parses URL-encoded requests (optional)

const cors = require("cors");
app.use(
  cors({
    origin: "http://3.110.37.136",
    // origin: ["http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/architect", architectRoutes);
app.use("/leads", leadRoutes);
app.use("/designs", designRoutes);
app.use("/activityLog", activityLogRoutes);
app.use("/user", userRoutes);
app.use("/customer", customerRoutes);
app.use("/files", require("./routes/imgRoute"));
app.use("/workProgress", require("./routes/workProgressRoute"));

const port = process.env.PORT || 5000;


checkFirebaseConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing the app:", error.message);
  });
