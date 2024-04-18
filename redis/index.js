const express = require("express");
const redis = require("redis");
const mysql = require('mysql2');

const app = express();


const db = mysql.createPool({
  host: 'localhost',
  user: "root",
  port: "3306",
  password: "12345678",
  database: "blog",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error: ", err);
    return;
  }
  console.log("Database connected");
  connection.release(); 
});




(async () => {
    const redisClient = redis.createClient({
        host: "localhost",
        port: 6379,
    });
    
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on("connect", () => {
        console.log("redis connected");
    });
    await redisClient.connect();
})();

// Express Middleware
app.use(express.json());

// Veri doğrulama middleware
function validateId(req, res, next) {
  const id = req.params.id;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  next();
}

// Cache kontrolü middleware
function checkCache(req, res, next) {
  const id = req.params.id;
  redisClient.get(id, (redisErr, redisData) => {
    if (redisErr) {
      console.error('Redis error:', redisErr);
      next();
      return;
    }

    if (redisData) {
      res.send(JSON.parse(redisData));
    } else {
      next();
    }
  });
}

app.get("/", (req, res) => {
    db.query("SELECT * FROM blog", (err, results, fields) => {
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


// Veri alma endpoint'i
app.get('/data/:id', validateId, checkCache, (req, res) => {
    const id = req.params.id;
  
    db.query('SELECT * FROM blog WHERE id = ?', [id], (mysqlErr, results) => {
      if (mysqlErr) {
        console.error('MySQL error:', mysqlErr);
        return res.status(500).send('Internal Server Error');
      }
  
      if (results.length === 0) {
        return res.status(404).send('Data not found');
      }

      // MySQL'den alınan veriyi Redis'e yaz
      redisClient.setex(id, 3600, JSON.stringify(results)); // 1 saat boyunca sakla
  
      res.send(results);
    });
});
process.on('SIGINT', () => {
    redisClient.quit(() => {
      console.log('Redis connection closed');
      process.exit();
    });
  });

// Sunucu dinleme
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



