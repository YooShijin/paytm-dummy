const mainRouter = require("./routes/index");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);
app.get("/", (req, res) => {
  res.send({
    msg: "Hello, world!",
  });
});
app.listen(3000, (req, res) => {
  console.log("Hue Hue Hue, Our app is running!");
});
