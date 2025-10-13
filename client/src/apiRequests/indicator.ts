import http from '@/lib/http'
import { DashboardIndicatorQueryParamsType, DashboardIndicatorResType } from '@/schemas/indicator.schema'
import queryString from 'query-string'

export const indicatorApi = {
  getDashBoardIndicators: (queryParams: DashboardIndicatorQueryParamsType) =>
    http.get<DashboardIndicatorResType>(
      '/indicators/dashboard?' +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
}

export default indicatorApi
