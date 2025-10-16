'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/lib/apifetch"
import { setTokens } from "@/lib/auth"

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
      const loginRes = await api.post("/login/", {
        username: name,
        password,
      })

      const loginData = loginRes.data

      if (!loginData.access || !loginData.refresh) {
        throw new Error("ورود ناموفق بود")
      }

      setTokens(loginData.access, loginData.refresh)
      window.dispatchEvent(new Event('storage'))

      const meRes = await api.get("/me/")
      const user = meRes.data

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
      console.error(err)
      setError(err.response?.data?.detail || err.message || "خطای غیرمنتظره‌ای رخ داد")
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
          className="w-full border p-2 rounded"
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
