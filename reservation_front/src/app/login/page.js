'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { fetchWithAuth } from '@/components/utils/api'  // مسیر api.js را تنظیم کن

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // لاگین ساده، چون توکن ها رو در اینجا دریافت می‌کنی
      const loginRes = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password }),
      })

      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.detail || "ورود ناموفق بود");
      }

      const loginData = await loginRes.json()
      localStorage.setItem('access_token', loginData.access)
      localStorage.setItem('refresh_token', loginData.refresh)

      // حالا درخواست کاربر را با fetchWithAuth بفرست
      const meRes = await fetchWithAuth('http://localhost:8000/api/me/', {
        method: 'GET',
      })

      if (!meRes.ok) {
        throw new Error("دریافت اطلاعات کاربر ناموفق بود");
      }

      const user = await meRes.json();

      // هدایت بر اساس نقش
      if (user.role === "vendor") {
        router.push(`/dashboard/${user.id}`)
      } else if (user.role === "customer") {
        router.push(`/`)
      } else if (user.role === "admin") {
        router.push(`/admin`)
      } else {
        router.push("/")
      }

    } catch (err) {
      setError(err.message || "خطای غیرمنتظره‌ای رخ داد")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">ورود</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="نام کاربری"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="رمز عبور"
          className="w-full border p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white rounded ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  )
}
