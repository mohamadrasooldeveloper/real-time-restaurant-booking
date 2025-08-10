'use client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  return (
    <header className="w-full container mx-auto px-4 py-4 bg-gray-100 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-700">رستوران من</h1>
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-green-600 text-white cursor-pointer rounded hover:bg-green-700 transition"
        >
          ورود
        </button>
        <button
          onClick={() => router.push('/register')}
          className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded hover:bg-blue-700 transition"
        >
          ثبت‌نام
        </button>
      </div>
    </header>
  )
}
