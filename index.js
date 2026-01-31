import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

let cache = {
  random: null,
  filter: {}
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const fallbackActivities = [
  { activity: "Go for a short walk", type: "relaxation", participants: 1 },
  { activity: "Read 10 pages of a book", type: "education", participants: 1 },
  { activity: "Clean your workspace", type: "busywork", participants: 1 },
  { activity: "Listen to a podcast", type: "relaxation", participants: 1 },
  { activity: "Call a friend", type: "social", participants: 2 },
  { activity: "Learn a new keyboard shortcut", type: "education", participants: 1 },
  { activity: "Stretch for 5 minutes", type: "relaxation", participants: 1 }
];


const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    if (cache.random && Date.now() - cache.random.time < CACHE_TTL) {
      return res.render("index.ejs", { data: cache.random.data });
    }

    const response = await axios.get("https://bored-api.appbrewery.com/random");
    cache.random = {
      data: response.data,
      time: Date.now()
    };

    res.render("index.ejs", { data: response.data });

  } catch {
    res.render("index.ejs", {
      error: "Service is busy. Please try again in a moment."
    });
  }
});


app.post("/", async (req, res) => {
  try {
    const { type, participants } = req.body;
    const key = `${type}-${participants}`;

    if (
      cache.filter[key] &&
      Date.now() - cache.filter[key].time < CACHE_TTL
    ) {
      return res.render("index.ejs", { data: cache.filter[key].data });
    }

    let url = "https://bored-api.appbrewery.com/filter?";
    if (type) url += `type=${type}&`;
    if (participants) url += `participants=${participants}`;

    const response = await axios.get(url);
    const result = response.data;

    if (!result.length) {
      return res.render("index.ejs", {
        error: "No activities found. Try different filters."
      });
    }

    const randomValue = Math.floor(Math.random() * result.length);
    const activity = result[randomValue];

    cache.filter[key] = {
      data: activity,
      time: Date.now()
    };

    res.render("index.ejs", { data: activity });

  } catch {
    console.error("API failed, using fallback");

    const random =
    fallbackActivities[
      Math.floor(Math.random() * fallbackActivities.length)
    ];

    res.render("index.ejs", {
    data: random,
    error: "Using offline suggestions due to high traffic."
    });
  }
});



app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
