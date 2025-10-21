'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/lib/apifetch"
import { setTokens } from "@/lib/auth"
import Link from "next/link"

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
        router.push(`/dashboard`)
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
const inputClass = `w-full border border-gray-300 dark:border-gray-700 p-3 rounded-xl
                      placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
                      focus:scale-[1.02] focus:shadow-lg transition-all
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`
  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 text-transparent bg-clip-text">
        ورود به رستوران من
      </h2>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-800 transition"
      >
        <input
  value={name}
  onChange={(e) => setName(e.target.value)}
  type="text"
  placeholder="نام کاربری"
  className={inputClass}
/>
<input
  type="password"
  placeholder="رمز عبور"
   className={inputClass}

  value={password}
  onChange={e => setPassword(e.target.value)}
  required
/>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow hover:shadow-lg"
          }`}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      {/* لینک به ثبت نام */}
      <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
        آیا حساب کاربری ندارید؟{" "}
        <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ثبت نام کنید
        </Link>
      </p>
    </div>
  )
}
