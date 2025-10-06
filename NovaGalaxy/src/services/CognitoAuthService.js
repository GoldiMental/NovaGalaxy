import { 
    CognitoIdentityProviderClient, 
    InitiateAuthCommand,
    RespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = "eu-central-1";

const USER_POOL_ID = "eu-central-1_sgQ0H9nFq";
const CLIENT_ID = "2tqi077p0itj85755if4shfsd5";

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

/**
 * Führt den Benutzer-Login über AWS Cognito durch.
 * @param {string} username - Der Benutzername.
 * @param {string} password - Das Passwort.
 * @returns {Promise<string>} Das JWT (Access Token).
 */
export const loginUser = async (username, password) => {
    try {
        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        };

        const command = new InitiateAuthCommand(params);
        const response = await cognitoClient.send(command);

        if (response.AuthenticationResult && response.AuthenticationResult.AccessToken) {
            
            sessionStorage.setItem('accessToken', response.AuthenticationResult.AccessToken);
            sessionStorage.setItem('idToken', response.AuthenticationResult.IdToken);
            
            console.log("Login erfolgreich, JWT erhalten.");
            return response.AuthenticationResult.AccessToken;
        } else {
            throw new Error("Fehler beim Login: Keine direkten Authentifizierungsergebnisse.");
        }

    } catch (error) {
        console.error("Cognito Login Fehler:", error);
        throw new Error(error.message || "Anmeldung fehlgeschlagen.");
    }
};

/**
 * Ruft den im Session Storage gespeicherten JWT Access Token ab.
 * @returns {string | null} Der JWT Access Token oder null.
 */
export const getAuthToken = () => {
    return sessionStorage.getItem('accessToken');
};

/**
 * Entfernt die Tokens aus dem Session Storage (simuliert den Logout).
 */
export const logoutUser = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('idToken');
    // Hinweis: Die eigentliche Invalidation des Tokens muss auf dem Backend erfolgen,
    // aber das Löschen des Tokens auf Client-Seite beendet die Session.
};

const API_BASE_URL = "https://a8mol3jod5.execute-api.eu-central-1.amazonaws.com";

/**
 * Ruft die geschützten Benutzerdaten vom API Gateway ab.
 */
export const fetchProtectedUserData = async () => {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error("Nicht autorisiert. Bitte melden Sie sich an.");
    }
    
    // Das Token wird im Authorization Header gesendet
    const response = await fetch(`${API_BASE_URL}/api/protected/user`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Abruf fehlgeschlagen: ${response.status} - ${errorData.msg || 'Token ungültig/abgelaufen'}`);
    }

    return response.json();
};
