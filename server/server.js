const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const User = require("./model/user");
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

const server = "127.0.0.1:27017"; // REPLACE WITH YOUR OWN SERVER
const database = "auth"; // REPLACE WITH YOUR OWN DB NAME

app.post("/api/register", async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    console.log(user);
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", error: "Dupicate email" });
  }
});
app.get("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "secret123"
    );
    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: false });
  }
});
app.get("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });

    return res.json({ status: "ok", quote: user.quote });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});
app.post("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });

    return res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${server}/${database}`, {
      useNewUrlParser: true,
    });
    app.listen(PORT, () => {
      console.log(`runing at PORT ${PORT}`);
    });

    console.log("MongoDB connected!!");
  } catch (err) {
    console.log("Failed to connect to MongoDB", err);
  }
};

connectDB();
