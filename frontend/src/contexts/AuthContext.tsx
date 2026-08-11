import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import * as authApi from "@/api/auth"
import { AUTH_TOKEN_KEY } from "@/lib/constants"
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  )
  const [isLoading, setIsLoading] = useState(true)

  const persistSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        if (!cancelled) {
          setUser(currentUser)
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [token, clearSession])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload)
      persistSession(response)
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await authApi.register(payload)
      persistSession(response)
    },
    [persistSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout: clearSession,
    }),
    [user, token, isLoading, login, register, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
