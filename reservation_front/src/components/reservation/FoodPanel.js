'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/apifetch'
import { UtensilsCrossed, DollarSign } from 'lucide-react'

export default function FoodPanel() {
  const [foods, setFoods] = useState([])

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await api.get('/foods/')
        setFoods(res.data)
      } catch (error) {
        console.error('خطا در دریافت منو:', error)
      }
    }

    fetchFoods()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300 text-center">منوی غذا</h2>

      {foods.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">غذایی ثبت نشده است.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {foods.map((food, index) => (
            <li
              key={food.id || index}
              className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-indigo-400" /> {food.name}
                </h3>
                <p className="flex items-center gap-1 text-indigo-500 dark:text-indigo-300 font-medium">
                  <DollarSign className="w-4 h-4" /> {food.price} تومان
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{food.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
