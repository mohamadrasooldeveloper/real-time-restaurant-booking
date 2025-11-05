'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/apifetch'
import { getAccessToken } from '@/lib/auth'

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCart(localCart)
        return
      }

      const res = await api.get('/cart/')
      setCart(res.data)
    } catch (error) {
      console.error('❌ Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (product, quantity = 1) => {
    const token = getAccessToken()
    if (token) {
      try {
        const res = await api.post('/cart/add/', {
          food_id: product.id,
          quantity,
        })
        setCart(res.data)
      } catch (error) {
        console.error('Error adding to cart:', error)
      }
    } else {
      // اگر لاگین نیست، سبد رو در localStorage نگه داریم
      const newCart = [...cart]
      const existing = newCart.find((item) => item.id === product.id)
      if (existing) existing.quantity += quantity
      else newCart.push({ ...product, quantity })
      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }
const removeFromCart = async (productId, fullRemove = false) => {
    const token = getAccessToken()

    if (token) {
        try {
            if (fullRemove) {
                const res = await api.delete('/cart/remove/', { data: { food_id: productId } })
                setCart(res.data)
            } else {
                const res = await api.post('/cart/decrement/', { food_id: productId })
                setCart(res.data)
            }
        } catch (error) {
            console.error('Error modifying/removing from cart:', error)
        }
    } else {
        const existingItem = cart.find((item) => item.food?.id === productId || item.id === productId)

        if (!existingItem) return
        
        let newCart

        if (existingItem.quantity > 1 && !fullRemove) {
            newCart = cart.map((item) =>
                (item.food?.id === productId || item.id === productId)
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        } else {
            // حذف کامل (اگر تعداد 1 بود یا fullRemove=true بود)
            newCart = cart.filter((item) => (item.food?.id !== productId && item.id !== productId))
        }

        setCart(newCart)
        localStorage.setItem('cart', JSON.stringify(newCart))
    }
}

  // 🧮 محاسبه قیمت کل
  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context)
    throw new Error('useCart must be used within a CartProvider')
  return context
}
