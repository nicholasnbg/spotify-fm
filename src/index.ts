import express from "express";

const app = express();
const port = 3535;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});
