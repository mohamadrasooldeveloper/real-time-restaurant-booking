'use client'

import { useCart } from '@/components/context/CartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Loader2, Minus, Plus, XCircle } from 'lucide-react'
import api from '@/lib/apifetch'
export default function CartPage() {
  const { cart, loading, addToCart, removeFromCart } = useCart()
  const router = useRouter()
  const [items, setItems] = useState([])
 const handleCheckout = async () => {
  try {
    if (!items.length) {
      alert("سبد خرید شما خالی است!");
      return;
    }

    const restaurantField = items[0]?.food?.restaurant;
    const restaurantId = typeof restaurantField === "object" 
      ? restaurantField.id 
      : restaurantField;

    if (!restaurantId) {
      alert("شناسه رستوران یافت نشد!");
      return;
    }

    const orderData = {
      restaurant: Number(restaurantId),
      items: items.map(item => ({
        food_id: item.food.id,
        quantity: item.quantity,
      })),
    };

    console.log(" داده نهایی سفارش:", orderData);

    const res = await api.post("/orders/", orderData);

    if (res.status === 201 || res.status === 200) {
      router.push(`/checkout/${res.data.uuid}`);
    } else {
      alert(res.data.detail || "خطا در ایجاد سفارش");
    }
  } catch (error) {
    console.error(" خطا در ایجاد سفارش:", error.response?.data || error);
    alert("خطا در ایجاد سفارش. لطفاً دوباره تلاش کنید.");
  }
};



  useEffect(() => {
    const currentItems = Array.isArray(cart) ? cart : cart?.items || []
    setItems(currentItems)
  }, [cart])

  const total = items.reduce((sum, item) => {
    const price = Number(item.food?.discounted_price || item.food?.price || 0)
    return sum + price * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="mr-3 text-lg text-gray-500">در حال بارگذاری...</p>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 text-center py-20 text-gray-700 bg-white rounded-xl shadow-lg m-6">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl font-semibold mb-2">سبد خرید شما خالی است</p>
        <p className="text-gray-500 mb-6">برای افزودن محصول، به صفحه محصولات بروید.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 flex items-center justify-center">
        <ShoppingCart className="w-7 h-7 ml-3 text-blue-600" /> سبد خرید شما
      </h1>
      
      <div className="bg-white shadow-2xl rounded-xl p-4 md:p-8">
        <ul className="space-y-6 divide-y divide-gray-100">
          {items.map((item) => {
            const food = item.food
            const price = Number(food?.discounted_price || food?.price || 0)
            const itemTotal = price * item.quantity

            return (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4"
              >
                {/* اطلاعات محصول */}
                <div className="flex items-center flex-grow mb-3 sm:mb-0">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{food.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      قیمت واحد: {price.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => removeFromCart(food.id, false)}
                      className="p-1 text-red-500 hover:text-red-700 transition"
                      aria-label="کم کردن یک عدد"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <span className="font-semibold text-gray-800 min-w-[30px] text-center mx-2">
                      {item.quantity.toLocaleString('fa-IR')}
                    </span>

                    <button
                      onClick={() => addToCart(food, 1)}
                      className="p-1 text-green-500 hover:text-green-700 transition"
                      aria-label="اضافه کردن یک عدد"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <span className="font-bold text-xl text-blue-600 min-w-[120px] text-left">
                    {itemTotal.toLocaleString('fa-IR')}
                    <span className="text-sm font-normal mr-1">تومان</span>
                  </span>
                  
                  <button
                    onClick={() => removeFromCart(food.id, true)} 
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                    aria-label="حذف کامل از سبد"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        {/* جمع کل و دکمه پرداخت */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-2xl text-gray-700">جمع کل سبد خرید:</span>
            <span className="text-3xl text-green-600 font-extrabold">
              {total.toLocaleString('fa-IR')}
              <span className="text-lg font-normal mr-1">تومان</span>
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center text-lg"
          >
            تکمیل سفارش و پرداخت
            <span className="mr-3">💳</span>
          </button>
        </div>
      </div>
    </div>
  )
}