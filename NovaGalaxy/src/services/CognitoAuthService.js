// COGNITO BROWSER POLYFILL (Fixes 'global is not defined' for local environments if needed)
if (typeof global === 'undefined' && typeof window !== 'undefined') {
    window.global = window;
}

const poolData = {
    UserPoolId: 'eu-central-1_sgQ0H9nFq', 
    ClientId: '2tqi077p0itj85755if4shfsd5'
};

// Globale SDK-Variablen
// Diese sollten über einen NPM-Import geladen werden, aber wir halten uns an die window-Zugriffsmethode für Konsistenz
const CognitoUserPool = window.CognitoUserPool;
const CognitoUser = window.CognitoUser;
const AuthenticationDetails = window.AuthenticationDetails;

export class CognitoAuthService {
    constructor() {
        if (!CognitoUserPool) {
            console.error("Cognito SDK nicht geladen. Auth wird fehlschlagen.");
            this.isSDKLoaded = false;
        } else {
             this.userPool = new CognitoUserPool(poolData);
             this.isSDKLoaded = true;
        }
    }

    async signIn(username, password) {
        if (!this.isSDKLoaded) throw new Error("Cognito SDK nicht verfügbar.");

        return new Promise((resolve, reject) => {
            const authenticationDetails = new AuthenticationDetails({ Username: username, Password: password });
            const cognitoUser = new CognitoUser({ Username: username, Pool: this.userPool });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (session) => {
                    resolve({ idToken: session.getIdToken().getJwtToken() });
                },
                onFailure: (err) => reject(err),
            });
        });
    }

    getIdToken() {
        if (!this.isSDKLoaded || !this.userPool) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const cognitoUser = this.userPool.getCurrentUser();
            if (!cognitoUser) return resolve(null);
            
            cognitoUser.getSession((err, session) => {
                if (err || !session || !session.isValid()) {
                    return resolve(null);
                }
                resolve(session.getIdToken().getJwtToken());
            });
        });
    }

    signOut() {
        if (this.userPool) {
             const cognitoUser = this.userPool.getCurrentUser();
             if (cognitoUser) cognitoUser.signOut();
        }
    }

    getPoolData() {
        return poolData;
    }
};