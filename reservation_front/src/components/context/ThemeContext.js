'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(undefined)

const defaultTheme = 'light'; 

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const preferredTheme =
      savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

    setTheme(preferredTheme)
  document.documentElement.classList.toggle('dark', preferredTheme === 'dark')
  setMounted(true);
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}