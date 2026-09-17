import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUsersList, getOrCreateDeviceAccount } from '@/server/admin.functions'

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

// Fallback compatibility objects for any stale client cache
export const STUDENT_USER: SessionUser = { id: '', name: '', grade: '', role: 'siswa' }
export const WATCHER_USER: SessionUser = { id: '', name: '', grade: '', role: 'guru_bk' }

type SessionContextValue = {
  activeUser: SessionUser | null
  usersList: SessionUser[]
  isWatcher: boolean
  hasUsers: boolean
  switchUser: (id: string) => void
  refreshUsers: () => Promise<void>
  updateActiveUser: (updates: Partial<SessionUser>) => void
  getOrCreateUser: (name?: string, role?: 'siswa' | 'guru_bk') => Promise<SessionUser>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usersList, setUsersList] = useState<SessionUser[]>([])
  const [activeUser, setActiveUser] = useState<SessionUser | null>(null)

  const loadAccountAndUsers = async () => {
    try {
      // 1. Get current device's permanent single account
      let savedId: string | undefined = undefined
      try {
        const raw =
          localStorage.getItem('bk_device_account_id') ||
          localStorage.getItem('bk_active_user_id') ||
          undefined
        if (raw && raw !== 'undefined' && raw !== 'null') {
          savedId = raw
        }
      } catch {}

      const res = await getOrCreateDeviceAccount({
        data: { deviceUserId: savedId },
      })

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
          localStorage.setItem('bk_device_account_id', sessionUser.id)
          localStorage.setItem('bk_active_user_id', sessionUser.id)
        } catch {}
      }

      // 2. Load members list for counselor/admin directories
      const list = await getUsersList()
      setUsersList(list)
    } catch (err) {
      console.error('Failed to initialize session:', err)
    }
  }

  useEffect(() => {
    loadAccountAndUsers()
  }, [])

  // Account switching is disabled per policy: 1 orang hanya boleh memiliki 1 akun
  const switchUser = (_id: string) => {
    console.warn('Pergantian akun tidak diizinkan: Setiap orang terikat pada 1 akun.')
  }

  const updateActiveUser = (updates: Partial<SessionUser>) => {
    setActiveUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const getOrCreateUser = async (
    _name?: string,
    _role: 'siswa' | 'guru_bk' = 'siswa',
  ): Promise<SessionUser> => {
    if (activeUser && activeUser.id) return activeUser

    let savedId: string | undefined = undefined
    try {
      const raw =
        localStorage.getItem('bk_device_account_id') ||
        localStorage.getItem('bk_active_user_id') ||
        undefined
      if (raw && raw !== 'undefined' && raw !== 'null') {
        savedId = raw
      }
    } catch {}

    const res = await getOrCreateDeviceAccount({
      data: { deviceUserId: savedId },
    })

    if (!res?.user) {
      return {
        id: `user-${Date.now()}`,
        name: 'Siswa',
        grade: 'Siswa',
        role: 'siswa',
      }
    }

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
      localStorage.setItem('bk_device_account_id', sessionUser.id)
      localStorage.setItem('bk_active_user_id', sessionUser.id)
    } catch {}

    return sessionUser
  }

  return (
    <SessionContext.Provider
      value={{
        activeUser,
        usersList,
        isWatcher: activeUser?.role === 'guru_bk',
        hasUsers: Boolean(activeUser),
        switchUser,
        refreshUsers: loadAccountAndUsers,
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
      switchUser: () => {},
      refreshUsers: async () => {},
      updateActiveUser: () => {},
      getOrCreateUser: async () => STUDENT_USER,
    }
  }
  return ctx
}
