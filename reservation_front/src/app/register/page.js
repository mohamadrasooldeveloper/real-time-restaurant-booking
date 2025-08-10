'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [role, setRole] = useState('customer') // state نقش
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const res = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username: name, email, password, password2, role })
    })

    if (res.ok) {
       alert('ثبت‌نام با موفقیت انجام شد.')
          if (role === 'customer') {
            router.push('/') // صفحه اصلی برای مشتری
          } else if (role === 'vendor') {
            router.push('/dashboard') // داشبورد برای فروشنده
          }
    } else {
      const data = await res.json()
      if (data.detail) {
        setError(data.detail)
      } else {
        const errorMessages = Object.entries(data)
          .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
          .join(' | ')
        setError(errorMessages || 'خطایی رخ داده است.')
      }
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ثبت‌نام</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="نام کامل"
          className="w-full border p-2 rounded"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="ایمیل"
          className="w-full border p-2 rounded"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="رمز عبور (حداقل ۶ کاراکتر و شامل عدد)"
          className="w-full border p-2 rounded"
          required
        />
        <input
  value={password2}
  onChange={(e) => setPassword2(e.target.value)}
  type="password"
  placeholder="تکرار رمز عبور"
  className="w-full border p-2 rounded"
  required
/>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="customer">مشتری</option>
          <option value="vendor">فروشنده</option>
        </select>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          ثبت‌نام
        </button>
      </form>
    </div>
  )
}
