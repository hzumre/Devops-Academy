"use strict";
const express = require("express");
const dbConnection = require("./helper/mysql");

const app = express();


app.post("/students/add/:name/:midterm_grade/:final_grade", (req, res)=> {
    const sql = "INSERT INTO students (name, midterm_grade, final_grade) VALUES (?, ?, ?)";
    dbConnection.query(sql, [req.params.name, req.params.midterm_grade, req.params.final_grade], (err, results, fields) => {
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
  
  app.get("/students/:id", (req, res) => {
    dbConnection.query(
      "SELECT name, (midterm_grade + final_grade) / 2 AS ortalama_not FROM students WHERE id = ?",
      [req.params.id],
      (err, results, fields) => {
        if (err) {
          console.log("Database query error: ", err);
        } else {
          res.status(200).json({
            status: "success",
            data: results,
          });
        }
      }
    );
  });

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
