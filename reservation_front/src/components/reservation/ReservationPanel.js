'use client'
import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import api from '@/lib/apifetch'
import { CalendarDays, Clock, Users, Phone, MessageSquare, User } from 'lucide-react'

export default function ReservationPanel() {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/')
        setReservations(res.data)
      } catch (error) {
        console.error('خطا در دریافت رزروها:', error)
      }
    }

    fetchReservations()

    const pusher = new Pusher('9512f63fb48eb46cb8fa', { cluster: 'mt1' })
    const channel = pusher.subscribe('reservations')

    channel.bind('new-reservation', function (data) {
      setReservations(prev => [data, ...prev])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-indigo-300 text-center">
        رزروهای جدید
      </h2>

      {reservations.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          هیچ رزروی ثبت نشده است.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reservations.map((res, index) => (
            <li
              key={res.id || index}
              className="p-5 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {res.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-400" /> {res.date}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" /> {res.time}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> {res.guests} نفر
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" /> {res.phone}
                </p>
              </div>

              <div className="mt-3 border-t border-indigo-100 dark:border-gray-700 pt-3">
                <p className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5" />
                  {res.message || 'بدون پیام'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
