import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },    
    agreedToAGB: {
        type: Boolean,
        required: true,
    },
    agreedToDSE: {
        type: Boolean,
        required: true,
    },
    shipName: {
        type: String,
        default: 'Nova Phoenix',
    },
    credits: {
        type: Number,
        default: 1000,
    }
});

let User;
try {
    User = mongoose.model('User');
} catch (error) {
    User = mongoose.model('User', userSchema);
}

export default User;