'use client'
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import api from "@/lib/apifetch"
import { setTokens } from "@/lib/auth"
import Link from "next/link"
import toast from "react-hot-toast"

const schema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
})

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const loginRes = await api.post("/login/", {
        username: data.username,
        password: data.password,
      })

      const { access, refresh } = loginRes.data
      setTokens(access, refresh)
      window.dispatchEvent(new Event("storage"))

      toast.success("🎉 ورود موفقیت‌آمیز بود!", {
        style: { background: "#16a34a", color: "#fff" },
      })

      const meRes = await api.get("/me/")
      const user = meRes.data

      if (user.role === "vendor") router.push("/dashboard")
      else if (user.role === "customer") router.push("/")
      else if (user.role === "admin") router.push("/admin")
      else router.push("/")

    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.detail || "خطای ناشناخته‌ای رخ داده است."

      if (err.response?.status === 404) {
        toast.error("🚫 کاربری با این نام وجود ندارد، لطفاً ابتدا ثبت‌نام کنید.", {
          style: { background: "#f87171", color: "#fff" },
        })
      } else if (err.response?.status === 401) {
        toast.error("🔐 رمز عبور اشتباه است!", {
          style: { background: "#facc15", color: "#000" },
        })
      } else {
        toast.error(msg)
      }
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
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-800 transition"
      >
        {/* نام کاربری */}
        <div>
          <input
            type="text"
            placeholder="نام کاربری"
            {...register("username")}
            className={inputClass}
          />
          {errors.username && (
            <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* رمز عبور */}
        <div>
          <input
            type="password"
            placeholder="رمز عبور"
            {...register("password")}
            className={inputClass}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* دکمه ورود */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 shadow hover:shadow-lg"
          }`}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
        حساب کاربری ندارید؟{" "}
        <Link
          href="/register"
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          ثبت‌نام کنید
        </Link>
      </p>
    </div>
  )
}
