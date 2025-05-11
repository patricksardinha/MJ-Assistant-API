require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Route pour tester la connexion à la DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()"); // Test avec une requête simple
    res.json({ message: "DB Connection successful", time: result.rows[0] });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


app.post("/users", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.put("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
