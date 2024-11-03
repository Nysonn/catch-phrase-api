import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;
const API_URL = process.env.API_URL;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

// Render main page with all catchphrases
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/catchphrases`);
    res.render("index.ejs", { catchphrases: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching catchphrases" });
  }
});

// Render page to create a new catchphrase
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Catchphrase", submit: "Create Catchphrase" });
});

// Render edit page for a specific catchphrase
app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/catchphrases/${req.params.id}`);
    res.render("modify.ejs", {
      heading: "Edit Catchphrase",
      submit: "Update Catchphrase",
      catchphrase: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching catchphrase" });
  }
});

// Create a new catchphrase
app.post("/api/catchphrases", async (req, res) => {
  try {
    await axios.post(`${API_URL}/catchphrases`, req.body);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating catchphrase" });
  }
});

// Update a catchphrase
app.post("/api/catchphrases/:id", async (req, res) => {
  try {
    await axios.patch(`${API_URL}/catchphrases/${req.params.id}`, req.body);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating catchphrase" });
  }
});

// Delete a catchphrase
app.get("/api/catchphrases/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/catchphrases/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting catchphrase" });
  }
});

app.listen(port, () => {
  console.log(`Frontend server is running on http://localhost:${port}`);
});
