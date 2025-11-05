'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CreditCard,
  Calendar,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RotateCw,
} from 'lucide-react'

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(19, 'شماره کارت باید ۱۶ رقم باشد.')
    .max(19, 'شماره کارت باید ۱۶ رقم باشد.')
    .regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, 'فرمت شماره کارت نامعتبر است (xxxx-xxxx-xxxx-xxxx)'),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, 'ماه انقضا (MM) نامعتبر است.'),
  expiryYear: z
    .string()
    .regex(/^(2[4-9]|[3-9]\d)$/, 'سال انقضا (YY) نامعتبر است.'),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV2 باید ۳ یا ۴ رقم باشد.'),
  dynamicPassword: z
    .string()
    .min(6, 'رمز پویا ۶ رقمی است.')
    .max(6, 'رمز پویا ۶ رقمی است.')
    .regex(/^\d{6}$/, 'رمز پویا نامعتبر است.'),
})

const formatCardNumber = (value) => {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '').substring(0, 16)
  const parts = []
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.substring(i, i + 4))
  }
  return parts.join('-')
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

const INITIAL_TIMER = 120

export default function PaymentForm({ totalAmount = 540000 }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [timer, setTimer] = useState(INITIAL_TIMER)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const timerRef = useRef()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
  })

  const watchedCardNumber = watch('cardNumber', '')

  useEffect(() => {
    const formatted = formatCardNumber(watchedCardNumber)
    if (watchedCardNumber !== formatted) {
      setValue('cardNumber', formatted, { shouldValidate: formatted.length === 19 })
    }
  }, [watchedCardNumber, setValue])

  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer((prev) => prev - 1), 1000)
      return () => clearInterval(timerRef.current)
    } else if (timer === 0) {
      clearInterval(timerRef.current)
      setIsTimerActive(false)
    }
    return () => clearInterval(timerRef.current)
  }, [isTimerActive, timer])

  const handleResendCode = () => {
    if (!isTimerActive) {
      console.log('درخواست مجدد رمز پویا...')
      setTimer(INITIAL_TIMER)
      setIsTimerActive(true)
      setValue('dynamicPassword', '')
    }
  }

  const onSubmit = async (data) => {
    setIsProcessing(true)
    setPaymentStatus(null)
    if (isTimerActive) {
      clearInterval(timerRef.current)
      setIsTimerActive(false)
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPaymentStatus(Math.random() < 0.8 ? 'success' : 'fail')
    setIsProcessing(false)
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">درگاه پرداخت امن</h2>

      <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600">مبلغ قابل پرداخت</p>
        <p className="text-3xl font-extrabold text-blue-700 mt-1">
          {totalAmount.toLocaleString('fa-IR')} <span className="text-lg">تومان</span>
        </p>
      </div>

      {paymentStatus === 'success' && (
        <div className="flex items-center p-3 mb-4 text-green-700 bg-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 ml-2" />
          <span>پرداخت موفقیت‌آمیز بود ✅</span>
        </div>
      )}

      {paymentStatus === 'fail' && (
        <div className="flex items-center p-3 mb-4 text-red-700 bg-red-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 ml-2" />
          <span>پرداخت ناموفق بود. لطفاً مجدد تلاش کنید ❌</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* شماره کارت */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            <CreditCard className="w-4 h-4 ml-1 text-blue-500" />
            شماره کارت
          </label>
          <input
            type="text"
            maxLength={19}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            className={`p-3 border rounded-xl text-sm focus:outline-none transition-all duration-200 ${
              errors.cardNumber
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
            {...register('cardNumber')}
          />
          {errors.cardNumber && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 ml-1" />
              {errors.cardNumber.message}
            </p>
          )}
        </div>

        {/* ماه و سال انقضا */}
        <div className="flex gap-1 w-full">
          {[
            { label: 'ماه انقضا (MM)', name: 'expiryMonth' },
            { label: 'سال انقضا (YY)', name: 'expiryYear' },
          ].map((item, i) => (
            <div key={i} className="w-1/2 flex flex-col">
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <Calendar className="w-4 h-4 ml-1 text-blue-500" />
                {item.label}
              </label>
              <input
                type="text"
                maxLength={2}
                placeholder={item.name === 'expiryMonth' ? 'MM' : 'YY'}
                className={`p-3 border rounded-xl text-sm focus:outline-none transition-all duration-200 ${
                  errors[item.name]
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
                }`}
                {...register(item.name)}
              />
              {errors[item.name] && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 ml-1" />
                  {errors[item.name].message}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CVV2 */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            <Lock className="w-4 h-4 ml-1 text-blue-500" />
            CVV2
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="***"
            className={`p-3 border rounded-xl text-sm focus:outline-none transition-all duration-200 ${
              errors.cvv
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
            {...register('cvv')}
          />
          {errors.cvv && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 ml-1" />
              {errors.cvv.message}
            </p>
          )}
        </div>

        {/* رمز پویا و تایمر */}
        <div className="flex items-end gap-3 w-full">
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
              <Key className="w-4 h-4 ml-1 text-blue-500" />
              رمز پویا
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="******"
              className={`p-3 border rounded-xl text-sm focus:outline-none transition-all duration-200 ${
                errors.dynamicPassword
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
              }`}
              {...register('dynamicPassword')}
            />
            {errors.dynamicPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 ml-1" />
                {errors.dynamicPassword.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={isTimerActive}
            className={`min-w-[120px] h-[46px] flex items-center justify-center px-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isTimerActive
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
            }`}
          >
            {isTimerActive ? (
              <span className="font-semibold">{formatTime(timer)}</span>
            ) : (
              <>
                <RotateCw className="w-4 h-4 ml-1" />
                دریافت رمز
              </>
            )}
          </button>
        </div>

        {/* دکمه پرداخت */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3 mt-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center ${
            isProcessing
              ? 'bg-blue-300 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              در حال پردازش...
            </>
          ) : (
            'پرداخت و تکمیل سفارش'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
        <p>🔒 این صفحه توسط پروتکل امن SSL محافظت می‌شود.</p>
      </div>
    </div>
  )
}
