import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

export interface User {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  photoUrl: string | null;
  role: "participant" | "admin";
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we already have a token
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        // Try to get user profile with existing token
        try {
          const response = await api.get("/users/me");
          setUser(response.data);
          setLoading(false);
          return;
        } catch (e) {
          // Token invalid, continue to authenticate
          localStorage.removeItem("token");
        }
      }

      // Get Telegram initData
      const tg = window.Telegram?.WebApp;
      if (!tg?.initData) {
        // Development mode - no Telegram
        console.warn("No Telegram WebApp available - development mode");
        setLoading(false);
        return;
      }

      // Authenticate with backend
      const authResponse = await axios.post(`${API_URL}/auth/telegram`, {
        initData: tg.initData,
      });

      const { access_token, user: userData } = authResponse.data;
      localStorage.setItem("token", access_token);
      setUser(userData);
    } catch (e) {
      console.error("Authentication error:", e);
      setError("Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.patch("/users/me", data);
      setUser(response.data);
    } catch (e) {
      console.error("Failed to update profile:", e);
      throw e;
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { api };
