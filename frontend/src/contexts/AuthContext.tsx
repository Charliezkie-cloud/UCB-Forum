import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import * as authApi from "@/api/auth"
import { getUserBanStatus } from "@/api/profiles"
import { isBanOngoing } from "@/lib/ban"
import { AUTH_TOKEN_KEY } from "@/lib/constants"
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserBanResponse,
} from "@/types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isBanned: boolean
  activeBan: UserBanResponse | null
  login: (payload: LoginRequest) => Promise<{ response: AuthResponse; isBanned: boolean }>
  register: (payload: RegisterRequest) => Promise<{ response: AuthResponse; isBanned: boolean }>
  logout: () => void
  refreshBanStatus: () => Promise<boolean>
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
  const [activeBan, setActiveBan] = useState<UserBanResponse | null>(null)
  const [isBanned, setIsBanned] = useState(false)

  const persistSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
    setActiveBan(null)
    setIsBanned(false)
  }, [])

  const loadBanStatus = useCallback(async (userId: number): Promise<boolean> => {
    try {
      const ban = await getUserBanStatus(userId)
      const ongoing = isBanOngoing(ban)
      setActiveBan(ongoing ? ban : null)
      setIsBanned(ongoing)
      return ongoing
    } catch (err: unknown) {
      // Mirror BannedUserFilter: a ban-related 403 means the account is locked out.
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { status?: number; data?: { message?: string } } })
          .response
        if (
          res?.status === 403 &&
          typeof res.data?.message === "string" &&
          res.data.message.toLowerCase().includes("banned")
        ) {
          setActiveBan(null)
          setIsBanned(true)
          return true
        }
      }
      setActiveBan(null)
      setIsBanned(false)
      return false
    }
  }, [])

  const refreshBanStatus = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setActiveBan(null)
      setIsBanned(false)
      return false
    }
    return loadBanStatus(user.userId)
  }, [user, loadBanStatus])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        if (cancelled) return
        setUser(currentUser)
        await loadBanStatus(currentUser.userId)
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
  }, [token, clearSession, loadBanStatus])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload)
      persistSession(response)
      const banned = await loadBanStatus(response.user.userId)
      return { response, isBanned: banned }
    },
    [persistSession, loadBanStatus],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await authApi.register(payload)
      persistSession(response)
      const banned = await loadBanStatus(response.user.userId)
      return { response, isBanned: banned }
    },
    [persistSession, loadBanStatus],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      isBanned,
      activeBan: isBanned ? activeBan : null,
      login,
      register,
      logout: clearSession,
      refreshBanStatus,
    }),
    [
      user,
      token,
      isLoading,
      isBanned,
      activeBan,
      login,
      register,
      clearSession,
      refreshBanStatus,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
