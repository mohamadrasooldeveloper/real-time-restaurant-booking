'use client'
import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'

export default function ReservationPanel() {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    const pusher = new Pusher('9512f63fb48eb46cb8fa', {
      cluster: 'mt1',
    })

    console.log('📡 Subscribing to channel...')

    const channel = pusher.subscribe('reservations')

    channel.bind('new-reservation', function (data) {
      console.log('📥 New reservation received:', data)
      setReservations((prev) => [data, ...prev])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">رزروهای جدید</h2>
      {reservations.length === 0 && <p>هیچ رزروی ثبت نشده است.</p>}
      <ul>
        {reservations.map((res, index) => (
          <li key={index} className="border p-3 mb-3 rounded shadow">
            <p><strong>نام:</strong> {res.name}</p>
            <p><strong>تاریخ:</strong> {res.date}</p>
            <p><strong>ساعت:</strong> {res.time}</p>
            <p><strong>مهمان‌ها:</strong> {res.guests}</p>
            <p><strong>شماره تماس:</strong> {res.phone}</p>
            <p><strong>پیام:</strong> {res.message || 'ندارد'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
