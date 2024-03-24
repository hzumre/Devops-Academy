const express = require("express");
const mysql = require("mysql2");
const amqp = require('amqplib');
const app = express();

const connection = mysql.createPool({
    connectionLimit: 10,
    host: "mysql-service",     
    user: "root",
    password: "password",
    database: "devopsakedemi"
});

connection.getConnection((err, connection) => {
    if(err){
        console.log("Error connecting to database");
    }
    else{
        console.log("Connected to database");
    }
});

app.get("/", (req ,res)=>{
    res.send("Hello World");
});

async function sendMessage() {
    try {
        const connection = await amqp.connect('amqp://rabbitmq-service:5672');
        const channel = await connection.createChannel();
        const queue = 'message-queue';
        const message = 'INSERT INTO students (name, score) VALUES (\'Hatice\', 80);'; // SQL sorgusu
        
        await channel.assertQueue(queue);
        await channel.sendToQueue(queue, Buffer.from(message));
        console.log("Message sent:", message);
    
        await channel.close();
        await connection.close();
        
        // sendMessage tamamlandıktan sonra receiveMessage'i çağır
        receiveMessage();
    } catch (error) {
        console.error("Error:", error);
    }
}

async function receiveMessage() {
    try {
        const connection = await amqp.connect('amqp://rabbitmq-service:5672');
        const channel = await connection.createChannel();
        const queue = 'message-queue';
        
        await channel.assertQueue(queue);
        console.log("Waiting for messages...");
    
        channel.consume(queue, async (message) => {
            const content = message.content.toString();
            console.log("Message received:", content);
            
            // Mesaj içeriğini işleme
            const sqlQuery = content;

            // Mesajı veritabanına kaydetme işlemi
            connection.query(sqlQuery, (error, results, fields) => {
                if (error) {
                    console.error("Error executing SQL query:", error);
                } else {
                    console.log("SQL query executed:", sqlQuery);
                }
            });
        }, { noAck: true });
    } catch (error) {
        console.error("Error:", error);
    }
}

// sendMessage fonksiyonunu çağırarak RabbitMQ'ya SQL sorgusu gönder
sendMessage();

app.listen(2000, ()=> {
    console.log("Server is starting on port 2000")
});

