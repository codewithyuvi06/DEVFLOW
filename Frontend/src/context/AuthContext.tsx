
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest } from '../services/api'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  githubUsername?: string
  preferences?: {
    theme: 'dark' | 'light' | 'system'
    emailNotifications: boolean
    productUpdates: boolean
    issueAssignments: boolean
    weeklyDigest: boolean
    compactDensity: boolean
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    try {
      const response = await apiRequest<{
        success: boolean
        data: { user: User }
      }>('/auth/me')

      setUser(response.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
