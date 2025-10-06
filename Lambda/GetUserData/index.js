import { connectToDatabase, User } from './src/db_connector.js';

/**
 * Holt geschützte Benutzerdaten aus MongoDB nach erfolgreicher Autorisierung durch Cognito.
 * * @param {object} event - Das Lambda-Event-Objekt.
 * @returns {object} Response mit Benutzerdaten oder Fehlermeldung.
 */
export const handler = async (event) => {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('Datenbankverbindungsfehler:', dbError);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Server-Fehler: Datenbankverbindung nicht möglich.' }),
        };
    }

    let userIdFromToken;
    let usernameFromToken;
    
    try {
        const claims = event.requestContext.authorizer.jwt.claims;
        
        userIdFromToken = claims.sub; 
        usernameFromToken = claims['cognito:username'];

        if (!userIdFromToken) {
            console.error('Token-Claims unvollständig:', claims);
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Autorisierungsdaten im Token fehlen.' }),
            };
        }
        
    } catch (error) {
        console.error('Fehler beim Extrahieren der Token-Claims:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({ msg: 'Autorisierung fehlgeschlagen.' }),
        };
    }
    
    try {
        const user = await User.findOne({ username: usernameFromToken }).select('-password -__v');

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ msg: 'Benutzer nicht gefunden.' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Geschützte Daten erfolgreich abgerufen.",
                user: user
            }),
        };
        
    } catch (err) {
        console.error('MongoDB Abfragefehler:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Server-Fehler bei der Datenabfrage.' }),
        };
    }
};
