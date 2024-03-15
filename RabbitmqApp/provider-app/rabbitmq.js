const amqp = require('amqplib');

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://user:password@localhost');
        const channel = await connection.createChannel();
        return channel;
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error; // Hata oluştuğunda hatayı yeniden fırlat
    }
}

module.exports = connectToRabbitMQ;
