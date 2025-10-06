import mongoose from 'mongoose';
import User from './model_User.js';

let isConnected;

export async function connectToDatabase() {
    if (isConnected) {
        return; 
    }

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        throw new Error('MONGODB_URI Umgebungsvariable ist nicht gesetzt.');
    }

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log('Mit MongoDB Atlas verbunden (Cold Start)');
    } catch (err) {
        console.error('MongoDB-Verbindungsfehler:', err.message);
        throw err; 
    }
}

export { User }; 