import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUsersList, createMember } from '@/server/admin.functions'

export type UserRole = 'siswa' | 'guru_bk'

export type SessionUser = {
  id: string
  name: string
  grade: string
  role: string
  phone?: string | null
  bio?: string | null
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
  getOrCreateUser: (name?: string, role?: 'siswa' | 'guru_bk') => Promise<SessionUser>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usersList, setUsersList] = useState<SessionUser[]>([])
  const [activeUser, setActiveUser] = useState<SessionUser | null>(null)

  const loadUsers = async () => {
    try {
      const list = await getUsersList()
      setUsersList(list)

      const savedId = localStorage.getItem('bk_active_user_id')
      if (savedId) {
        const found = list.find((u) => u.id === savedId)
        if (found) {
          setActiveUser(found)
          return
        }
      }

      if (list.length > 0) {
        setActiveUser(list[0])
        localStorage.setItem('bk_active_user_id', list[0].id)
      } else {
        setActiveUser(null)
      }
    } catch (err) {
      console.error('Failed to load session users:', err)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const switchUser = (id: string) => {
    const found = usersList.find((u) => u.id === id)
    if (found) {
      setActiveUser(found)
      try {
        localStorage.setItem('bk_active_user_id', found.id)
      } catch {
        // ignore
      }
    }
  }

  const getOrCreateUser = async (
    name?: string,
    role: 'siswa' | 'guru_bk' = 'siswa',
  ): Promise<SessionUser> => {
    if (activeUser) return activeUser
    if (usersList.length > 0) {
      setActiveUser(usersList[0])
      try {
        localStorage.setItem('bk_active_user_id', usersList[0].id)
      } catch {}
      return usersList[0]
    }

    const newUser = await createMember({
      data: {
        name: name?.trim() || 'Siswa',
        role,
        grade: role === 'guru_bk' ? 'Guru BK' : 'Siswa',
        phone: '',
        bio: '',
      },
    })

    const sessionUser: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      grade: newUser.grade,
      role: newUser.role,
      phone: newUser.phone,
      bio: newUser.bio,
    }

    setActiveUser(sessionUser)
    setUsersList([sessionUser])
    try {
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
        hasUsers: usersList.length > 0,
        switchUser,
        refreshUsers: loadUsers,
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
      getOrCreateUser: async () => STUDENT_USER,
    }
  }
  return ctx
}
