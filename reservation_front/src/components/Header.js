'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearTokens, getAccessToken } from '@/lib/auth'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // بررسی تم ذخیره‌شده در localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }

    // بررسی ورود کاربر
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

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  const handleLogout = () => {
    clearTokens()
    setIsLoggedIn(false)
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <header className="w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-5 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-700 dark:text-gray-100">رستوران من</h1>
        <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/50 shadow-sm border-b border-indigo-100 dark:border-gray-800 transition-all">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        {/* لوگو */}
        <h1
          onClick={() => router.push('/')}
          className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-300 dark:to-indigo-500 text-transparent bg-clip-text cursor-pointer tracking-tight"
        >
          رستوران من 🍽️
        </h1>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3">
          {/* تم */}
          <button
            onClick={toggleTheme}
            className="p-2 cursor-pointer rounded-xl bg-white/70 dark:bg-gray-800/60 border border-indigo-100 dark:border-gray-700 shadow hover:shadow-md transition"
            title={isDark ? 'حالت روشن' : 'حالت تاریک'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>

          {/* ورود / خروج */}
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => router.push('/login')}
                className="px-4 cursor-pointer py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                ورود
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 cursor-pointer py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
              >
                ثبت‌نام
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 cursor-pointer py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              خروج
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
