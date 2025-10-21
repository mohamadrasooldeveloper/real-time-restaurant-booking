'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/apifetch'

export default function RestaurantMenuPage({ restaurantId }) {
  const [restaurant, setRestaurant] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await api.get(`/restaurants-public/`)
        console.log(res)
        if (res.status !== 200) throw new Error('خطا در دریافت اطلاعات رستوران')
        const data = res.data
        const found = data.find(r => r.id === Number(restaurantId))
        if (!found) throw new Error('رستوران یافت نشد')
        setRestaurant(found)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurant()
  }, [restaurantId])

  if (loading) return <div>در حال بارگذاری منو...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!restaurant) return null

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-center font-bold mb-4">{restaurant.name}</h1>
      {restaurant.image && ( 
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-100 object-cover rounded"
          loading="lazy"
        />
      )}
      <h2 className="text-2xl text-blue-600 font-semibold my-4">منوی غذاها</h2>
      {restaurant.foods.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 bg-Amber-500 gap-4">
          {restaurant.foods.map(food => {
            const hasDiscount = food.discount_percent > 0
            const price = Number(food.price)
            const discountedPrice = Number(food.discounted_price)

            return (
              <li key={food.id} className="border flex justify-between p-2 bg-orange-400 text-white rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                <div className="flex items-center gap-2">
                  {hasDiscount ? (
                    <>
                      <span className="line-through text-red-500 font-bold text-sm">
                        {price.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className="text-green-600 font-bold text-lg">
                        {discountedPrice.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className="bg-yellow-300 text-xs px-2 py-1 rounded text-black">
                        {food.discount_percent}% تخفیف
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-800">
                      {price.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>منویی برای این رستوران ثبت نشده است.</p>
      )}
    </div>
  )
}
