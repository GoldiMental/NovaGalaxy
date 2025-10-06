import { connectToDatabase, User } from './src/db_connector.js';
import { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

export const handler = async (event) => {
    const { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = process.env;

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ msg: 'Ungültiger Request Body (JSON erwartet).' }) };
    }
    
    const { username, email, password, agreedToAGB, agreedToDSE } = body;

    if (!username || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ msg: 'Benutzername, E-Mail und Passwort sind erforderlich.' }) };
    }
    if (!agreedToAGB || !agreedToDSE) {
        return { statusCode: 400, body: JSON.stringify({ msg: 'AGB/Datenschutzerklärung müssen akzeptiert werden.' }) };
    }

    try {
        const signUpCommand = new SignUpCommand({
            ClientId: COGNITO_CLIENT_ID,
            Username: username,
            Password: password,
            UserAttributes: [
                { Name: 'email', Value: email },
            ],
        });
        
        await cognitoClient.send(signUpCommand);

        const confirmCommand = new AdminConfirmSignUpCommand({
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: username,
        });
        await cognitoClient.send(confirmCommand);

    } catch (cognitoError) {
        console.error('Cognito Registrierungsfehler:', cognitoError);
        if (cognitoError.name === 'UsernameExistsException') {
            return { statusCode: 400, body: JSON.stringify({ msg: 'Benutzername/E-Mail ist bereits registriert.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ msg: 'Cloud-Authentifizierungsfehler: ' + cognitoError.message }) };
    }
    
    try {
        await connectToDatabase();
        const newUser = new User({ 
            username, 
            email, 
            agreedToAGB, 
            agreedToDSE,
        });
        await newUser.save();

        return {
            statusCode: 201,
            body: JSON.stringify({ msg: 'Benutzer erfolgreich in Cloud und Datenbank registriert.' }),
        };

    } catch (err) {
        console.error('MongoDB-Speicherfehler:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Server-Fehler: Registrierung in MongoDB fehlgeschlagen.' }),
        };
    }
};