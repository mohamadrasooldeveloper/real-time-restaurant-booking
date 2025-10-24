'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import api from "@/lib/apifetch"

const registerSchema = z
  .object({
    username: z.string().min(3, "نام باید حداقل ۳ کاراکتر باشد"),
    email: z.string().email("ایمیل معتبر نیست"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    password2: z.string(),
    role: z.enum(["customer", "vendor"], {
      required_error: "لطفاً نقش خود را انتخاب کنید",
    }),
  })
  .refine((data) => data.password === data.password2, {
    message: "رمزهای عبور مطابقت ندارند",
    path: ["password2"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  })

  const onSubmit = async (data) => {
    setServerError("")
    setLoading(true)
    try {
      const res = await api.post("/register/", data)
      alert("ثبت‌نام با موفقیت انجام شد 🎉")

      if (data.role === "vendor") {
        router.push("/restaurant-settings")
      } else {
        router.push("/login")
      }
    } catch (err) {
      console.error(err.response || err)
      setServerError(
        err.response?.data?.detail ||
          err.response?.data?.email?.[0] ||
          "خطای غیرمنتظره‌ای رخ داد"
      )
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
            <p className="text-red-600 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* ایمیل */}
        <div>
          <input
            type="email"
            placeholder="ایمیل"
            {...register("email")}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
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
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* تکرار رمز عبور */}
        <div>
          <input
            type="password"
            placeholder="تکرار رمز عبور"
            {...register("password2")}
            className={inputClass}
          />
          {errors.password2 && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password2.message}
            </p>
          )}
        </div>

        {/* نقش کاربر */}
        <div>
          <select {...register("role")} className={`${inputClass} appearance-none`}>
            <option value="" hidden>
              نقش خود را انتخاب کنید
            </option>
            <option value="customer">مشتری</option>
            <option value="vendor">فروشنده</option>
          </select>
          {errors.role && (
            <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* خطای سرور */}
        {serverError && (
          <p className="text-red-600 dark:text-red-400 text-sm text-center">
            {serverError}
          </p>
        )}

        {/* دکمه ثبت‌نام */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all flex items-center justify-center ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow hover:shadow-lg"
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              در حال ثبت‌نام...
            </span>
          ) : (
            "ثبت‌نام"
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
        حساب کاربری دارید؟{" "}
        <Link
          href="/login"
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          ورود کنید
        </Link>
      </p>
    </div>
  )
}
