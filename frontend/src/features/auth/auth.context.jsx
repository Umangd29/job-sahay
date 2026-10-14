import { createContext, useState, useEffect, useCallback } from "react";
import { getMe, loginUser, registerUser, logoutUser } from "./services/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session on application load
  const restoreSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await getMe();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await registerUser(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      return { success: true };
    } catch (error) {
      setUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        handleLogin,
        handleRegister,
        handleLogout,
        restoreSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
