'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/apifetch'
import { Plus } from 'lucide-react'
import { useCart } from '@/components/context/CartContext'
export default function RestaurantMenuPage({ restaurantId }) {
  const [restaurant, setRestaurant] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { cart, addToCart } = useCart()
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await api.get(`/restaurants-public/`)
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

  if (loading) return <div className="text-center p-8 text-lg">در حال بارگذاری منو...</div>
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>
  if (!restaurant) return null

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-center font-extrabold text-indigo-600 dark:text-indigo-300 mb-6">
        {restaurant.name}
      </h1>
      {restaurant.image && ( 
        <div className="w-full h-64 relative mb-6">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover rounded-lg shadow-lg dark:shadow-gray-800 transition-all"
            loading="lazy"
          />
        </div>
      )}
      {restaurant.menu_image && (
        <div className="w-full h-96 relative mb-6">
          <img
            src={restaurant.menu_image}
            alt="منوی غذا"
            className="w-full h-full object-cover rounded-lg shadow-lg dark:shadow-gray-800 transition-all"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 rounded-lg shadow-lg">
            منوی غذا
          </div>
        </div>
      )}
      <h2 className="text-2xl text-indigo-500 dark:text-indigo-300 font-semibold my-6 text-center">
        منوی غذاها
      </h2>
      {restaurant.foods.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurant.foods.map(food => {
            const hasDiscount = food.discount_percent > 0
            const price = Number(food.price)
            const discountedPrice = Number(food.discounted_price)

            return (
              <li key={food.id} className="flex flex-col items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start w-full space-y-4 md:space-y-0 md:space-x-4">
  <div className="flex flex-col w-full">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{food.name}</h3>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
  {hasDiscount ? (
    <>
      <div className="flex items-center gap-2">
        <span className="line-through text-red-500 font-semibold text-sm">
          {price.toLocaleString('fa-IR')} تومان
        </span>
        <span className="text-green-600 font-bold text-lg">
          {discountedPrice.toLocaleString('fa-IR')} تومان
        </span>
      <span className="bg-yellow-300 text-xs px-2 py-1 rounded text-black font-medium">
        {food.discount_percent}%
      </span>
      </div>
    </>
  ) : (
    <span className="font-semibold text-gray-800 dark:text-white text-lg">
      {price.toLocaleString('fa-IR')} تومان
    </span>
  )}
  
   <button
    onClick={() => addToCart(food)}
    className="bg-indigo-600 cursor-pointer text-white rounded-lg py-2 px-6 md:px-8 w-full md:w-auto hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-4 md:mt-0"
  >
    <Plus className="h-5 w-5" />
    افزودن
  </button>
</div>


  </div>
</div>

              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">منویی برای این رستوران ثبت نشده است.</p>
      )}
    </div>
  )
}
