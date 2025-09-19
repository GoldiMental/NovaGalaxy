import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'Kein Token, Autorisierung verweigert.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.jwt_Key);
        req.user = decoded.user;
        next(); // Wichtig: Leitet die Anfrage an die nächste Funktion weiter
    } catch (e) {
        res.status(401).json({ msg: 'Token ist nicht gültig.' });
    }
};

export default auth;