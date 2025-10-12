'use client'

import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { OrderStatus } from '@/constants/type'
import socket from '@/lib/socket'
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListMutation } from '@/queries/useGuest'
import { PayGuestOrdersResType, UpdateOrderResType } from '@/schemas/order.schema'
import Image from 'next/image'
import { useEffect } from 'react'

export default function OrdersCart() {
  const { data, refetch } = useGuestGetOrderListMutation()
  const orders = data?.payload.data || []

  const { waitingForPayment, paid } = orders.reduce(
    (total, order) => {
      if (order.status === OrderStatus.Paid) {
        return {
          ...total,
          paid: {
            quantity: order.quantity + total.paid.quantity,
            price: order.quantity * order.dishSnapshot.price + total.paid.price,
          },
        }
      }
      return {
        ...total,
        waitingForPayment: {
          quantity: order.quantity + total.waitingForPayment.quantity,
          price: order.quantity * order.dishSnapshot.price + total.waitingForPayment.price,
        },
      }
    },
    {
      waitingForPayment: {
        quantity: 0,
        price: 0,
      },
      paid: {
        quantity: 0,
        price: 0,
      },
    },
  )

  console.log(orders)

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket.id)
    }

    function onDisconnect() {
      console.log('disconnected from server')
    }

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      console.log('Reveived update from server:', data)
      toast({
        title: 'Cập nhật đơn hàng',
        description: `${data.dishSnapshot.name} (SL: ${
          data.quantity
        }) vừa được cập nhật sang trạng thái "${getVietnameseOrderStatus(data.status)}".`,
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const guest = data[0].guest
      toast({
        description: `Bạn đã thanh toán thành công hóa đơn.`,
      })
      refetch()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('update-order', onUpdateOrder)
    socket.on('payment', onPayment)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('update-order', onUpdateOrder)
      socket.off('payment', onPayment)
    }
  }, [refetch])

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
      {paid.quantity !== 0 && (
        <div className="sticky bottom-0 p-2">
          <div className="flex justify-between w-full max-w-md mt-4 text-lg text-white font-medium">
            <span>Đơn đã thanh toán · {paid.quantity} món</span>
            <span className="text-yellow-400 font-semibold">{formatCurrency(paid.price)}</span>
          </div>
        </div>
      )}
      <div className="sticky bottom-0 p-2">
        <div className="flex justify-between w-full max-w-md mt-4 text-lg text-white font-medium">
          <span>Đơn chưa thanh toán · {waitingForPayment.quantity} món</span>
          <span className="text-yellow-400 font-semibold">{formatCurrency(waitingForPayment.price)}</span>
        </div>
      </div>
    </>
  )
}
