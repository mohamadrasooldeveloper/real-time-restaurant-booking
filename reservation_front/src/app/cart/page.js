'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/apifetch'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCart() {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setError("برای مشاهده سبد خرید باید وارد شوید.")
          return
        }

        const res = await api.get('/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.status !== 200) throw new Error('خطا در دریافت سبد خرید')
        
        // مطمئن شوید که cart آرایه است
        setCart(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleRemoveFromCart = async (foodId) => {
    try {
      const token = localStorage.getItem('access_token')
      const res = await api.delete(`/cart/remove/${foodId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 200) {
        alert("غذا از سبد خرید حذف شد.")
        setCart(cart.filter(item => item.id !== foodId))
      }
    } catch (err) {
      console.error("Error removing from cart:", err)
      alert("خطا در حذف غذا از سبد خرید.")
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">در حال بارگذاری سبد خرید...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (cart.length === 0) return <div>سبد خرید شما خالی است.</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-center font-bold mb-4">سبد خرید</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cart.map(item => {
          const price = Number(item.food.price)
          const discountedPrice = Number(item.food.discounted_price)
          const hasDiscount = item.food.discount_percent > 0

          return (
            <li key={item.id} className="border flex flex-col justify-between p-4 bg-orange-400 text-white rounded-lg shadow-lg hover:shadow-xl transition">
              <h3 className="font-bold text-lg mb-2">{item.food.name}</h3>

              {item.food.image && (
                <img
                  src={item.food.image}
                  alt={item.food.name}
                  className="w-full h-40 object-cover mb-2 rounded"
                  loading="lazy"
                />
              )}

              <div className="flex flex-col items-start gap-2">
                {hasDiscount ? (
                  <>
                    <span className="line-through text-red-500 font-bold text-sm">
                      {price.toLocaleString('fa-IR')} تومان
                    </span>
                    <span className="text-green-600 font-bold text-lg">
                      {discountedPrice.toLocaleString('fa-IR')} تومان
                    </span>
                    <span className="bg-yellow-300 text-xs px-2 py-1 rounded text-black">
                      {item.food.discount_percent}% تخفیف
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-gray-800">
                    {price.toLocaleString('fa-IR')} تومان
                  </span>
                )}
              </div>

              <button
                className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                حذف از سبد خرید
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex justify-between items-center">
        <span className="font-bold text-lg">مجموع:</span>
        <span className="text-2xl text-green-600">
          {cart.reduce((acc, item) => acc + (item.food.discounted_price || item.food.price), 0).toLocaleString('fa-IR')} تومان
        </span>
      </div>

      <button className="mt-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 w-full">
        تکمیل سفارش
      </button>
    </div>
  )
}
