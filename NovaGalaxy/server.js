import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from './src/middleware_jwt.js';
import userSchema from './src/model_User.js';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
        res.status(500).json({ msg: 'Server-Fehler.'});
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
        const payload = { user: { id: user.id}};

        jwt.sign(payload, process.env.jwt_Key,{expiresIn: '1h'}, (err, token) => {
            if(err) throw err;
            res.json({token, msg:'Login erfolgreich'})
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).json({'Server-Fehler':err.message});
    }
});

app.get('/api/protected/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({'Server-Fehler':err.message});
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 Stunde
        await user.save();
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const msg = {
            to: user.email,
            from: process.env.SENDER_EMAIL,
            subject: 'Passwort-Reset-Anfrage für NovaGalaxy®',
            html: `<p>Sie erhalten diese E-Mail, da Sie eine Passwort-Reset-Anfrage gestellt haben.</p>
            <p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Dieser Link ist 1 Stunde lang gültig.</p>`,
        };
        await sgMail.send(msg);
        res.status(200).json({ msg: 'Link wurde gesendet. Überprüfen Sie auch den Spam-Ordner.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server-Fehler' });
    }
});

app.post('/api/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ msg: 'Das Token ist ungültig oder abgelaufen.' });
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ msg: 'Ihr Passwort wurde erfolgreich zurückgesetzt.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server-Fehler' });
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});