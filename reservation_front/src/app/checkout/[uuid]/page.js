"use client";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/apifetch";
export default function CheckoutPage({ params}) {
  const { uuid } = useParams();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

const onSubmit = async (data) => {
    try {
      const res = await api.post(`/orders/${uuid}/checkout/`, data);
      const json = res.data;
      console.log("Checkout response:", json);

      alert("آدرس شما ثبت شد ✅");

      const refCode = json.order_uuid;
      router.push(`/fake-gateway/${refCode}`);
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("مشکلی در ارتباط با سرور پیش آمد.");
      }
    }
  };


  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4">تکمیل اطلاعات سفارش</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("address", { required: true })}
          placeholder="آدرس دقیق تحویل"
          className="border p-2 rounded"
        />
        <input
          {...register("phone", { required: true })}
          placeholder="شماره تماس"
          className="border p-2 rounded"
        />
        <textarea
          {...register("note")}
          placeholder="یادداشت برای رستوران (اختیاری)"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          ثبت و ادامه به پرداخت 💳
        </button>
      </form>
    </div>
  );
}
