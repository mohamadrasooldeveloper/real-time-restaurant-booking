'use client'

import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PlusCircle, Trash2 } from "lucide-react"
import api from "@/lib/apifetch"
import { useState } from "react"

const restaurantSchema = z.object({
  name: z.string().min(3, "نام رستوران باید حداقل ۳ کاراکتر باشد"),
  address: z.string().min(5, "آدرس باید حداقل ۵ کاراکتر باشد"),
  phone: z
    .string()
    .regex(/^0\d{10}$/, "شماره تلفن باید ۱۱ رقم و با 0 شروع شود"),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  menuItems: z
    .array(
      z.object({
        name: z.string().min(2, "نام غذا لازم است"),
        price: z.string().min(1, "قیمت لازم است"),
      })
    )
    .optional(),
})

export default function RestaurantSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(restaurantSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      description: "",
      menuItems: [{ name: "", price: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "menuItems",
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError("")
    try {
      await api.post("/restaurant/settings/", data)
      alert("تنظیمات رستوران با موفقیت ذخیره شد ✅")
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      setServerError(err.response?.data?.detail || "خطایی رخ داد. لطفاً دوباره تلاش کنید.")
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
        تنظیمات رستوران
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-800 transition"
      >
        {/* نام رستوران */}
        <div>
          <label className="block text-sm font-medium mb-1">نام رستوران</label>
          <input {...register("name")} placeholder="مثلاً: رستوران بهشت" className={inputClass} />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* آدرس */}
        <div>
          <label className="block text-sm font-medium mb-1">آدرس</label>
          <input {...register("address")} placeholder="تهران، خیابان ولیعصر..." className={inputClass} />
          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
        </div>

        {/* تلفن */}
        <div>
          <label className="block text-sm font-medium mb-1">شماره تلفن</label>
          <input {...register("phone")} placeholder="09123456789" className={inputClass} />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        {/* توضیحات */}
        <div>
          <label className="block text-sm font-medium mb-1">توضیحات</label>
          <textarea
            {...register("description")}
            placeholder="در مورد رستوران خود توضیح دهید..."
            className={`${inputClass} h-24`}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* آیتم‌های منو */}
        <div>
          <label className="block text-sm dark:text-gray-400 font-medium mb-2 flex items-center justify-between">
            منوی غذا
            <button
              type="button"
              onClick={() => append({ name: "", price: "" })}
              className="text-indigo-600 cursor-pointer text-sm flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-4 h-4" /> افزودن آیتم
            </button>
          </label>

      {fields.map((item, index) => (
  <div
    key={item.id}
    className="flex flex-col sm:flex-row items-center gap-4 mb-4 
               p-4 rounded-2xl border border-gray-200 dark:border-gray-700 
               bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
               shadow-sm hover:shadow-md hover:-translate-y-0.5 
               transition-all duration-300 ease-out"
  >
    {/* فیلدها */}
    <div className="flex flex-col sm:gap-4 w-full">
      {/* نام غذا */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          نام غذا
        </label>
        <input
          {...register(`menuItems.${index}.name`)}
          placeholder="مثلاً پاستا آلفردو"
          className={`${inputClass} w-full text-sm placeholder:text-gray-400`}
        />
      </div>

      {/* قیمت */}
      <div className="mt-3 sm:mt-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          قیمت (تومان)
        </label>
        <input
          {...register(`menuItems.${index}.price`)}
          placeholder="250,000"
          className={`${inputClass} w-full text-sm text-right placeholder:text-gray-400`}
        />
      </div>
    </div>

    {/* دکمه حذف */}
    <button
      type="button"
      onClick={() => remove(index)}
      className="flex items-center justify-center p-2 rounded-xl 
                 text-red-500 p-2 border border-indigo-100 dark:border-gray-700 shadow 
                 hover:shadow-md hover:bg-red-500 hover:text-white 
                 transition-all cursor-pointer duration-300
                 active:scale-95"
      title="حذف آیتم"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  </div>
))}
          {errors.menuItems && (
            <p className="text-red-600 text-sm mt-1">{errors.menuItems.message}</p>
          )}
        </div>

        {/* خطای سرور */}
        {serverError && (
          <p className="text-red-600 text-center text-sm">{serverError}</p>
        )}

        {/* دکمه ذخیره */}
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
              در حال ذخیره...
            </span>
          ) : (
            "ذخیره تنظیمات"
          )}
        </button>
      </form>
    </div>
  )
}
