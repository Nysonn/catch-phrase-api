import express from "express";
import bodyParser from "body-parser";
// import { Client } from "pg";
import pkg from 'pg';
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;

const app = express();
const port = process.env.PORT;

// PostgreSQL client setup
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect().then(() => console.log("Connected to PostgreSQL")).catch(err => console.error("Connection error", err.stack));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET all catchphrases
app.get("/catchphrases", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM catchphrases");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching catchphrases" });
  }
});

// GET a random catchphrase
app.get("/catchphrases/random", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM catchphrases ORDER BY RANDOM() LIMIT 1");
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching random catchphrase" });
  }
});

// GET a catchphrase by ID
app.get("/catchphrases/:id", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM catchphrases WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Catchphrase not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching catchphrase by ID" });
  }
});

// POST a new catchphrase
app.post("/catchphrases", async (req, res) => {
  const { catchphrase, actor, tv_show, network } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO catchphrases (catchphrase, actor, tv_show, network) VALUES ($1, $2, $3, $4) RETURNING *",
      [catchphrase, actor, tv_show, network]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating catchphrase" });
  }
});

// PATCH a catchphrase
app.patch("/catchphrases/:id", async (req, res) => {
  const { catchphrase, actor, tv_show, network } = req.body;
  try {
    const result = await client.query(
      "UPDATE catchphrases SET catchphrase = COALESCE($1, catchphrase), actor = COALESCE($2, actor), tv_show = COALESCE($3, tv_show), network = COALESCE($4, network) WHERE id = $5 RETURNING *",
      [catchphrase, actor, tv_show, network, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Catchphrase not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating catchphrase" });
  }
});

// DELETE a catchphrase
app.delete("/catchphrases/:id", async (req, res) => {
  try {
    const result = await client.query("DELETE FROM catchphrases WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Catchphrase not found" });
    res.json({ message: "Catchphrase deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting catchphrase" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
