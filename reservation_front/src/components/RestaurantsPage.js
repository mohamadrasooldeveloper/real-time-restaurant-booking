'use client'
import { useEffect, useState } from 'react'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import api from '@/lib/apifetch'
export default function RestaurantsPage() {
  const [mounted, setMounted] = useState(false)
  const [restaurants, setRestaurants] = useState(null)
  const [error, setError] = useState(null)

  // رزرو
  const [showModal, setShowModal] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [value, setValue] = useState(null)
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const resetForm = () => {
    setValue(null)
    setTime('')
    setGuests(2)
    setName('')
    setPhone('')
    setMessage('')
  }

  const handleReserveSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      restaurant_id: selectedRestaurant?.id,
      date: value?.format("YYYY-MM-DD"),
      time,
      guests: Number(guests),
      name,
      phone,
      message,
    }

    try {
      const res = await api.post('/reservations/')

      if (res.ok) {
        alert('رزرو با موفقیت ثبت شد!')
        setShowModal(false)
        resetForm()
      } else {
        const data = await res.json()
        alert(data?.error || 'خطا در ارسال رزرو')
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور')
    }
  }
useEffect(() => {
  setMounted(true)

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await api.get('/restaurants-public/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })

      setRestaurants(res.data)

    } catch (err) {
      console.error('خطا در دریافت اطلاعات:', err)
      setError(err.message || 'خطای ناشناخته')
    }
  }

  fetchData()
}, [])




  if (!mounted) return null
  if (error) return <div className="text-center p-8 text-red-500">خطا: {error}</div>
  if (!restaurants) return <div className="text-center p-8">در حال بارگذاری...</div>
  if (restaurants.length === 0) return <div className="text-center p-8">رستورانی یافت نشد.</div>

  const inputClass = `w-full border border-gray-300 dark:border-gray-700 p-3 rounded-xl
                      placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
                      focus:scale-[1.02] focus:shadow-lg transition-all
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 text-transparent bg-clip-text text-center">
        رستوران‌ها
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full'>
      {restaurants.map((rest) => (
        <div key={rest.id} className="border-[2px] border-indigo-400 rounded-lg shadow-lg bg-white dark:bg-gray-800 transition-all hover:scale-[1.02] hover:shadow-2xl">
          {rest.image && (
            <img
              src={rest.image}
              alt={rest.name}
              className="w-full h-100 object-cover rounded-lg transition-all"
              loading="lazy"
            />
          )}

          <div className="flex flex-col p-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{rest.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{rest.description}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedRestaurant(rest)
                  setShowModal(true)
                }}
                className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-semibold rounded-lg px-5 py-2 transition-all"
              >
                رزرو میز
              </button>
              <a
                href={`/restaurants/${rest.id}`}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2 transition-all"
              >
                مشاهده منو
              </a>
            </div>
          </div>
        </div>
      ))}
</div>
      {showModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-lg"
            >
              ×
            </button>
            <h2 className="text-xl font-extrabold mb-4 text-center text-gray-800 dark:text-white">
              رزرو میز در "{selectedRestaurant.name}"
            </h2>

            <form onSubmit={handleReserveSubmit} className="space-y-5 w-full">
              <DatePicker
                value={value}
                onChange={setValue}
                calendar={persian}
                locale={persian_fa}
                containerClassName="w-full"
                inputClass={inputClass}
                placeholder="تاریخ رزرو"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className={inputClass}
                placeholder="تعداد مهمانان"
                required
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="نام کامل"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="شماره تماس"
                required
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
                placeholder="درخواست خاص (اختیاری)"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all"
              >
                ثبت رزرو
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
