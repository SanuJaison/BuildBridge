import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api, { clearToken, storeToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const userId = account?.user?.id || account?.user?._id;

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setAccount(data);
      return data;
    } catch {
      clearToken();
      setAccount(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return undefined;
    }

    const token = localStorage.getItem("bb_token");
    const nextSocket = io({
      path: "/socket.io",
      withCredentials: true,
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
    });
    socketRef.current = nextSocket;
    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      if (socketRef.current === nextSocket) socketRef.current = null;
    };
  }, [userId]);

  const applyAccount = useCallback((data) => {
    if (data?.token) storeToken(data.token);
    setAccount(data);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      applyAccount(data);
      return data;
    },
    [applyAccount]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      applyAccount(data);
      return data;
    },
    [applyAccount]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearToken();
      setAccount(null);
      window.dispatchEvent(new CustomEvent("bb:signed-out"));
    }
  }, []);

  const value = useMemo(
    () => ({
      account,
      user: account?.user || null,
      providerProfile: account?.providerProfile || null,
      organization: account?.organization || null,
      workspace: account?.workspace || null,
      organizationRole: account?.organizationRole || null,
      loading,
      socket,
      isAuthenticated: Boolean(account?.user),
      isAdmin: account?.user?.role === "admin",
      isProvider: account?.user?.role === "provider",
      login,
      register,
      logout,
      refresh,
      applyAccount,
    }),
    [account, loading, socket, login, register, logout, refresh, applyAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
