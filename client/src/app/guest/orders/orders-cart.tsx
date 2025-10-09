'use client'

import { Badge } from '@/components/ui/badge'
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListMutation } from '@/queries/useGuest'
import Image from 'next/image'

export default function OrdersCart() {
  const { data } = useGuestGetOrderListMutation()
  const orders = data?.payload.data || []

  const totalPrice = orders.reduce((total, order) => {
    return total + order.dishSnapshot.price * order.quantity
  }, 0)

  console.log(orders)
  return (
    <>
      <h1 className="text-center text-xl font-bold">🧾 Đơn hàng</h1>
      {orders.map((order, index) => (
        <div key={order.id} className="flex gap-4 ">
          <div className="text-sm font-semibold">{index + 1}.</div>
          <div className="flex-shrink-0 relative">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={100}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <p className="text-xs">{order.dishSnapshot.description}</p>
            <div className="text-xs font-semibold">
              <Badge variant="secondary">
                {formatCurrency(order.dishSnapshot.price)} x {order.quantity}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Badge variant="outline">{getVietnameseOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 p-2">
        <div className="flex justify-between w-full max-w-md mt-4 text-lg text-white font-medium">
          <span>Giá tiền · {orders.length} món</span>
          <span className="text-yellow-400 font-semibold">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </>
  )
}
