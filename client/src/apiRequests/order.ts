import http from '@/lib/http'
import {
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from '@/schemas/order.schema'
import querystring from 'query-string'

const orderApi = {
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `/orders?${querystring.stringify({
        fromDate: queryParams.fromDate ? queryParams.fromDate.toISOString() : undefined,
        toDate: queryParams.toDate ? queryParams.toDate.toISOString() : undefined,
      })}`,
    ),

  updateOrder: (orderId: number, body: UpdateOrderBodyType) => http.put<UpdateOrderResType>(`/orders/${orderId}`, body),

  getOrderDetail: (orderId: number) => http.get<GetOrderDetailResType>(`/orders/${orderId}`),

  pay: (body: PayGuestOrdersBodyType) => http.post<PayGuestOrdersResType>(`/orders/pay`, body),
}

export default orderApi
