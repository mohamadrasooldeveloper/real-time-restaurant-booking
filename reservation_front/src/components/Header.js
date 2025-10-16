'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearTokens, getAccessToken } from '@/lib/auth'

export default function Navbar() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setIsLoggedIn(!!token)
    setAuthChecked(true)

    const handleStorageChange = () => {
      const newToken = getAccessToken()
      setIsLoggedIn(!!newToken)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    clearTokens()
    setIsLoggedIn(false)
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <header className="w-full container mx-auto px-4 py-4 bg-gray-100 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-700">رستوران من</h1>
        <div className="w-28 h-8 bg-gray-200 rounded animate-pulse"></div>
      </header>
    )
  }

  return (
    <header className="w-full container mx-auto px-4 py-4 bg-gray-100 flex justify-between items-center shadow-sm">
      <h1
        onClick={() => router.push('/')}
        className="text-xl font-bold text-gray-700 cursor-pointer"
      >
        رستوران من
      </h1>

      <div className="flex gap-4">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              ورود
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              ثبت‌نام
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded hover:bg-red-700 transition"
          >
            خروج
          </button>
        )}
      </div>
    </header>
  )
}
