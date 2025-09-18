require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MongoDB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Mit MongoDB verbunden'))
    .catch(err => console.error('MongoDB-Verbindungsfehler:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    agreedToAGB: { type: Boolean, required: true, },
    agreedToDSE: { type: Boolean, required: true, },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { return next(); }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    const { username, email, password, agreedToAGB, agreedToDSE } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ msg: 'Benutzername/E-Mail bereits vergeben.' });
        }

        if (!agreedToAGB || !agreedToDSE) {
            return res.status(400).json({ msg: 'AGB/Datenschutzerklärung müssen akzeptiert werden.' });
        }

        const newUser = new User({ username, email, password, agreedToAGB, agreedToDSE });
        await newUser.save();

        res.status(201).json({ msg: 'Benutzer erfolgreich registriert.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server-Fehler');
    }
});

app.post('/api/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });

        if (!user) {
            return res.status(400).json({ msg: 'Ungültige Anmeldeinformation.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Ungültige Anmeldeinformation.' });
        }

        res.status(200).json({ msg: 'Login erfolgreich!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server-Fehler');
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});