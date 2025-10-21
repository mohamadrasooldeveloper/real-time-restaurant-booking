'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RestaurantSettingsPage() {
  const [restaurantName, setRestaurantName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/restaurant/settings', {
        name: restaurantName,
        address,
        phone,
        description,
        menuItems,
      })

      alert('تنظیمات رستوران با موفقیت ذخیره شد.')
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('خطایی رخ داد. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-600">تنظیمات رستوران</h2>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-lg">
        {/* اطلاعات عمومی رستوران */}
        <div>
          <label className="block text-sm">نام رستوران</label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="نام رستوران"
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">آدرس رستوران</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="آدرس"
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">شماره تلفن</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره تلفن"
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm">توضیحات رستوران</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات"
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
          />
        </div>

        {/* دکمه ذخیره */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            'ذخیره تنظیمات'
          )}
        </button>
      </form>
    </div>
  )
}
