"use strict";
const express = require("express");
const connectToRabbitMQ = require("./rabbitmq");

const app = express();
const PORT = 3000;

let channel; 

async function startServer() {
    try {
        channel = await connectToRabbitMQ(); 
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

app.use(express.json()); 

app.post('/student/add', async (req, res) => {
    try {
        const { studentName, score } = req.body;

        await channel.assertQueue("studentQueue");
        await channel.sendToQueue('studentQueue', Buffer.from(JSON.stringify({ studentName, score })));

        res.status(200).json({ message: 'Veri RabbitMQ\'ya gönderildi' });
    } catch (error) {
        console.error('Error while sending data to RabbitMQ:', error);
        res.status(500).json({ error: 'Veri RabbitMQ\'ya gönderilirken bir hata oluştu' });
    }
});



startServer();

app.listen(PORT, () => {
    console.log(`REST API server ${PORT} portunda çalışıyor...`);
});

process.on('SIGINT', () => {
    if (channel) {
        channel.close(); 
    }
    process.exit(0);
});

