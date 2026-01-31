import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/random");
    const result = response.data;
    console.log(result);
    res.render("index.ejs", { data: result });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.post("/", async (req, res) => {
  try {
    const { type, participants } = req.body;

    let url = "https://bored-api.appbrewery.com/filter?";
    if (type) url += `type=${type}&`;
    if (participants) url += `participants=${participants}`;

    const response = await axios.get(url);
    const result = response.data;

    if (!result.length) {
      return res.render("index.ejs", {
        error: "No activities found. Try different filters.",
      });
    }

    const randomValue = Math.floor(Math.random() * result.length);
    res.render("index.ejs", { data: result[randomValue] });

  } catch (error) {
    console.error(error.message);
    res.render("index.ejs", {
      error: "API limit reached. Try again later.",
    });
  }
});


app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
