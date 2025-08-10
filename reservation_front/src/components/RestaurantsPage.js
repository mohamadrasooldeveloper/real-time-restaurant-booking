'use client'
import { useEffect, useState } from 'react'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"

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
      const res = await fetch('http://localhost:8000/api/reservations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

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
        const res = await fetch('http://localhost:8000/api/restaurants-public/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        })

        if (!res.ok) throw new Error('دریافت اطلاعات رستوران‌ها با خطا مواجه شد.')

        const data = await res.json()
        setRestaurants(data)
      } catch (err) {
        setError(err.message || 'خطای ناشناخته')
      }
    }

    fetchData()
  }, [])

  if (!mounted) return null
  if (error) return <div className="text-center p-8 text-red-500">خطا: {error}</div>
  if (!restaurants) return <div className="text-center p-8">در حال بارگذاری...</div>
  if (restaurants.length === 0) return <div className="text-center p-8">رستورانی یافت نشد.</div>

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">رستوران‌ها</h1>

      {restaurants.map((rest) => (
        <div key={rest.id} className="border rounded-lg p-4 shadow flex flex-col md:flex-row gap-4">
          {rest.image && (
            <img
              src={rest.image}
              alt={rest.name}
              className="w-full md:w-1/3 h-48 object-cover rounded"
              loading="lazy"
            />
          )}

          <div className="flex-1 flex flex-col gap-2">
            <h2 className="text-xl font-bold">{rest.name}</h2>
            <p className="text-gray-600">{rest.description}</p>

            <h3 className="font-semibold">منو:</h3>
            {rest.foods.length > 0 ? (
              <ul className="list-disc pr-4 space-y-1">
                {rest.foods.map((food) => (
                  <li key={food.id}>
                    {food.name} : {Number(food.discounted_price).toLocaleString('fa-IR')} تومان
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">منویی برای این رستوران ثبت نشده.</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedRestaurant(rest)
                  setShowModal(true)
                }}
                className="bg-green-600 cursor-pointer hover:bg-green-700 text-white rounded px-3 py-1"
              >
                رزرو میز
              </button>
              <a href={`/restaurants/${rest.id}`} className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1">
                مشاهده منو
              </a>
            </div>
          </div>
        </div>
      ))}

      {showModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-lg"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              رزرو میز در "{selectedRestaurant.name}"
            </h2>

            <form onSubmit={handleReserveSubmit} className="space-y-4 w-full">
              <DatePicker
                value={value}
                onChange={setValue}
                calendar={persian}
                locale={persian_fa}
                containerClassName="w-full"
                inputClass="w-full border p-2 rounded"
                placeholder="تاریخ رزرو"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border p-2 rounded"
                placeholder="تعداد مهمانان"
                required
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="نام کامل"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="شماره تماس"
                required
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="درخواست خاص (اختیاری)"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
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
