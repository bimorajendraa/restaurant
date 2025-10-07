import http from '@/lib/http'
import { GetOrdersResType, UpdateOrderBodyType, UpdateOrderResType } from '@/schemas/order.schema'

const orderApi = {
  getOrderList: () => http.get<GetOrdersResType>('/orders'),

  updateOrder: (orderId: number, body: UpdateOrderBodyType) => http.put<UpdateOrderResType>(`/orders/${orderId}`, body),
}

export default orderApi
