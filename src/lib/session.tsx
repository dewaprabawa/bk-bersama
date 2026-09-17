import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUsersList } from '@/server/admin.functions'
import { getCurrentUser, loginUser, registerUser } from '@/server/auth.functions'

export type UserRole = 'siswa' | 'guru_bk'

export type SessionUser = {
  id: string
  name: string
  grade: string
  role: string
  phone?: string | null
  bio?: string | null
  address?: string | null
  avatarUrl?: string | null
}

export const STUDENT_USER: SessionUser = { id: '', name: '', grade: '', role: 'siswa' }
export const WATCHER_USER: SessionUser = { id: '', name: '', grade: '', role: 'guru_bk' }

type SessionContextValue = {
  activeUser: SessionUser | null
  usersList: SessionUser[]
  isWatcher: boolean
  hasUsers: boolean
  isLoading: boolean
  login: (name: string, pin: string) => Promise<void>
  register: (name: string, grade: string, role: 'siswa' | 'guru_bk', pin: string) => Promise<void>
  logout: () => void
  switchUser: (id: string) => void
  refreshUsers: () => Promise<void>
  updateActiveUser: (updates: Partial<SessionUser>) => void
  getOrCreateUser: () => Promise<SessionUser>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usersList, setUsersList] = useState<SessionUser[]>([])
  const [activeUser, setActiveUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadInitialSession = async () => {
    setIsLoading(true)
    try {
      let savedId: string | undefined = undefined
      try {
        const raw =
          localStorage.getItem('bk_active_user_id') ||
          localStorage.getItem('bk_device_account_id') ||
          undefined
        if (raw && raw !== 'undefined' && raw !== 'null') {
          savedId = raw
        }
      } catch {}

      if (savedId) {
        const res = await getCurrentUser({ data: { userId: savedId } })
        if (res?.user) {
          const sessionUser: SessionUser = {
            id: res.user.id,
            name: res.user.name,
            grade: res.user.grade,
            role: res.user.role,
            phone: res.user.phone,
            bio: res.user.bio,
            address: res.user.address,
            avatarUrl: res.user.avatarUrl,
          }
          setActiveUser(sessionUser)
        } else {
          try {
            localStorage.removeItem('bk_active_user_id')
            localStorage.removeItem('bk_device_account_id')
          } catch {}
          setActiveUser(null)
        }
      } else {
        setActiveUser(null)
      }

      const list = await getUsersList()
      setUsersList(list)
    } catch (err) {
      console.error('Failed to initialize session:', err)
      setActiveUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialSession()
  }, [])

  const login = async (name: string, pin: string) => {
    const res = await loginUser({ data: { name, pin } })
    if (res?.user) {
      const sessionUser: SessionUser = {
        id: res.user.id,
        name: res.user.name,
        grade: res.user.grade,
        role: res.user.role,
        phone: res.user.phone,
        bio: res.user.bio,
        address: res.user.address,
        avatarUrl: res.user.avatarUrl,
      }
      setActiveUser(sessionUser)
      try {
        localStorage.setItem('bk_active_user_id', sessionUser.id)
        localStorage.setItem('bk_device_account_id', sessionUser.id)
      } catch {}
      const list = await getUsersList()
      setUsersList(list)
    }
  }

  const register = async (name: string, grade: string, role: 'siswa' | 'guru_bk', pin: string) => {
    const res = await registerUser({ data: { name, grade, role, pin } })
    if (res?.user) {
      const sessionUser: SessionUser = {
        id: res.user.id,
        name: res.user.name,
        grade: res.user.grade,
        role: res.user.role,
        phone: res.user.phone,
        bio: res.user.bio,
        address: res.user.address,
        avatarUrl: res.user.avatarUrl,
      }
      setActiveUser(sessionUser)
      try {
        localStorage.setItem('bk_active_user_id', sessionUser.id)
        localStorage.setItem('bk_device_account_id', sessionUser.id)
      } catch {}
      const list = await getUsersList()
      setUsersList(list)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('bk_active_user_id')
      localStorage.removeItem('bk_device_account_id')
    } catch {}
    setActiveUser(null)
  }

  const switchUser = (_id: string) => {
    console.warn('Gunakan fitur logout dan login untuk beralih akun.')
  }

  const updateActiveUser = (updates: Partial<SessionUser>) => {
    setActiveUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const getOrCreateUser = async (): Promise<SessionUser> => {
    if (activeUser && activeUser.id) return activeUser
    throw new Error('Silakan masuk (login) terlebih dahulu untuk melanjutkan.')
  }

  return (
    <SessionContext.Provider
      value={{
        activeUser,
        usersList,
        isWatcher: activeUser?.role === 'guru_bk',
        hasUsers: Boolean(activeUser),
        isLoading,
        login,
        register,
        logout,
        switchUser,
        refreshUsers: loadInitialSession,
        updateActiveUser,
        getOrCreateUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    return {
      activeUser: null,
      usersList: [],
      isWatcher: false,
      hasUsers: false,
      isLoading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      switchUser: () => {},
      refreshUsers: async () => {},
      updateActiveUser: () => {},
      getOrCreateUser: async () => STUDENT_USER,
    }
  }
  return ctx
}
