import { createContext, useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchApi = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...defaultOptions,
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.response = {
            status: response.status,
            data: data,
        };
        error.config = { url, options, _retry: options._retry };
        throw error;
    }

    return { data, status: response.status };
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);

    const initialCheckDone = useRef(false);

    const refreshAccessToken = useCallback(async () => {
        const response = await fetchApi('/auth/refresh', {
            method: 'POST',
        });
        return response.data;
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await fetchApi('/auth/me');
            if (response.data.success) {
                setUser(response.data.data.buyer);
                setIsAuthenticated(true);
            }
        } catch (err) {
            if (err.response?.status === 401 && !initialCheckDone.current) {
                try {
                    await refreshAccessToken();
                    const retryResponse = await fetchApi('/auth/me');
                    setUser(retryResponse.data.data.buyer);
                    setIsAuthenticated(true);
                } catch {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
            initialCheckDone.current = true;
        }
    }, [refreshAccessToken]);

    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (url, options = {}) => {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

            const response = await originalFetch(fullUrl, {
                ...options,
                credentials: 'include',
            });

            if (response.status === 401 && !options._retry) {
                const newOptions = { ...options, _retry: true };

                try {
                    await refreshAccessToken();
                    return window.fetch(fullUrl, newOptions);
                } catch (refreshError) {
                    setUser(null);
                    setIsAuthenticated(false);
                    window.location.href = '/login';
                    throw refreshError;
                }
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [refreshAccessToken]);

    useEffect(() => {
        if (!initialCheckDone.current) {
            checkAuthStatus();
        }
    }, [checkAuthStatus]);

    const login = async (email, password) => {
        setError(null);
        const response = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.data.success) {
            setUser(response.data.data);
            setIsAuthenticated(true);
        }

        return response.data;
    };

    const signup = async (email, firstName, lastName) => {
        setError(null);
        const response = await fetchApi('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                email,
                firstName,
                lastName
            }),
        });
        return response.data;
    };

    const completeSetup = async (setupData) => {
        setError(null);
        const response = await fetchApi('/auth/setup', {
            method: 'POST',
            body: JSON.stringify(setupData),
        });

        if (response.data.success) {
            setUser(response.data.data);
            setIsAuthenticated(true);
        }

        return response.data;
    };

    const logout = async () => {
        try {
            await fetchApi('/auth/logout', {
                method: 'POST',
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            initialCheckDone.current = false;
        }
    };

    const resendActivation = async (email) => {
        setError(null);
        const response = await fetchApi('/auth/resend-activation', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return response.data;
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        completeSetup,
        logout,
        resendActivation,
        api: {
            get: (url, config) => fetchApi(url, { method: 'GET', ...config }),
            post: (url, data, config) => fetchApi(url, { method: 'POST', body: JSON.stringify(data), ...config }),
            put: (url, data, config) => fetchApi(url, { method: 'PUT', body: JSON.stringify(data), ...config }),
            delete: (url, config) => fetchApi(url, { method: 'DELETE', ...config }),
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;