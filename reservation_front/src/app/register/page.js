'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/apifetch'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (!role) {
    setError('لطفاً نقش خود را انتخاب کنید.')
    return
  }

  if (password !== password2) {
    setError('رمزهای عبور با هم مطابقت ندارند.')
    return
  }

  setLoading(true)
  try {
    const res = await api.post('/register/', {
      username: name,
      email,
      password,
      password2,
      role
    })

    alert('ثبت‌نام با موفقیت انجام شد. می‌توانید وارد شوید.')

    if (role === 'vendor') {
      router.push('/restaurant-settings')
    } else {
      router.push('/login')
    }
  } catch (err) {
    console.error(err.response || err)
    setError(err.response?.data?.password?.[0] || err.response?.data?.detail || 'خطای غیرمنتظره‌ای رخ داد.')
  } finally {
    setLoading(false)
  }
}

  const inputClass = `w-full border border-gray-300 dark:border-gray-700 p-3 rounded-xl
                      placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
                      focus:scale-[1.02] focus:shadow-lg transition-all
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`

  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 text-transparent bg-clip-text">
        ثبت‌نام در رستوران من
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-800 transition">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="نام کامل"
          className={inputClass}
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="ایمیل"
          className={inputClass}
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="رمز عبور"
          className={inputClass}
          required
        />
        <input
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          type="password"
          placeholder="تکرار رمز عبور"
          className={inputClass}
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="" disabled hidden className="text-gray-400 dark:text-gray-500">
            نقش خود را انتخاب کنید
          </option>
          <option value="customer">مشتری</option>
          <option value="vendor">فروشنده</option>
        </select>

        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all flex items-center justify-center
                      ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow hover:shadow-lg'}`}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              در حال ثبت‌نام...
            </span>
          ) : (
            'ثبت‌نام'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
        حساب کاربری دارید؟{" "}
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ورود کنید
        </Link>
      </p>
    </div>
  )
}
