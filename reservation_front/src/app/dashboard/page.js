'use client'
import { useState } from 'react'
import ReservationPanel from '@/components/reservation/ReservationPanel'
import FoodPanel from '@/components/reservation/FoodPanel'
import { Utensils, CalendarDays } from 'lucide-react'

export default function TabsPanel() {
  const [activeTab, setActiveTab] = useState('reservations')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-6 transition-colors">
      <div className="container mx-auto">
        {/* تب‌های بالا */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'reservations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            رزروها
          </button>

          <button
            onClick={() => setActiveTab('foods')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'foods'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'
            }`}
          >
            <Utensils className="w-4 h-4" />
            منوی غذا
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl p-6 shadow-xl transition-all">
          {activeTab === 'reservations' && <ReservationPanel />}
          {activeTab === 'foods' && <FoodPanel />}
        </div>
      </div>
    </div>
  )
}
