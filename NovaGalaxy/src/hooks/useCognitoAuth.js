import React, { useState, useEffect, useCallback } from 'react';

/**
 * Hook zur Verwaltung des Authentifizierungszustands der Anwendung.
 * @param {CognitoAuthService} authService - Die initialisierte CognitoAuthService Instanz.
 */
export function useCognitoAuth(authService) {
    const [userToken, setUserToken] = useState(null);
    const [loading, setLoading] = useState(true); 

    const checkCurrentSession = useCallback(async () => {
        if (!authService) return;
        
        try {
            const token = await authService.getIdToken();
            if (token) {
                setUserToken(token);
            }
        } catch (error) {
            console.error("Fehler beim Abrufen der Session:", error);
        } finally {
            setLoading(false);
        }
    }, [authService]);

    useEffect(() => {
        if (authService) {
            checkCurrentSession();
        }
    }, [authService, checkCurrentSession]);

    const login = useCallback(async (username, password) => {
        if (!authService) return { success: false, msg: "Auth Service nicht bereit." };
        
        try {
            setLoading(true);
            const result = await authService.signIn(username, password);
            setUserToken(result.idToken);
            return { success: true };
        } catch (error) {
            return { success: false, msg: error.message || "Unbekannter Login-Fehler." };
        } finally {
            setLoading(false);
        }
    }, [authService]);

    const logout = useCallback(() => {
        if (authService) {
            authService.signOut();
            setUserToken(null);
        }
    }, [authService]);

    return { user: userToken, logout, loading, login };
};