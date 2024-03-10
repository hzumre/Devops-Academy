"use strict";
const express = require("express");
const dbConnection = require("./postgre");

const app = express();

dbConnection.connect((err, client) => {
    if (err) {
      console.error("Database connection error: ", err.stack);
    } else {
      console.log("Connected to PostgreSQL database");
    }
});
  
app.post("/student/add/:name/:puan", (req, res)=> {
  const sql = "INSERT INTO student (name, puan) VALUES ($1, $2)";
  dbConnection.query(sql, [req.params.name, req.params.puan], (err, results, fields) => {
    if (err) {
      console.log("Database query error: ", err);
      res.status(500).json({
        status: "error",
        message: "An error occurred while adding the student."
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Student added successfully."
      });
    }
  });
});

app.get("/students", (req, res) => {
  dbConnection.query("SELECT * FROM student", (err, results, fields) => {
    if (err) {
      console.log("Database query error: ", err);
    } else {
      res.status(200).json({
        status: "success",
        data: results,
      });
    }
  });
});

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });