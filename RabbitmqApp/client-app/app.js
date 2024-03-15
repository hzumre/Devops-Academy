const amqp = require('amqplib');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:password@localhost:5432/app');

const Student = sequelize.define('student', { 
    studentName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://user:password@localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue("studentQueue");

        channel.consume('studentQueue', async (msg) => {
            const { studentName, score } = JSON.parse(msg.content.toString());

            
            try {
                await Student.create({
                    studentName: studentName,
                    score: score
                });

                console.log('Data inserted into PostgreSQL:', { studentName, score });
                channel.ack(msg);
            } catch (error) {
                console.error('Error while inserting data into PostgreSQL:', error);
                channel.reject(msg, false);
            }
        });

        console.log('Connected to RabbitMQ and listening for messages');
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error;
    }
}



connectToRabbitMQ();




