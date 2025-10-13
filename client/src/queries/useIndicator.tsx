import indicatorApi from '@/apiRequests/indicator'
import { DashboardIndicatorQueryParamsType } from '@/schemas/indicator.schema'
import { useQuery } from '@tanstack/react-query'

export const useDashBoardIndicators = (queryParams: DashboardIndicatorQueryParamsType) => {
  return useQuery({
    queryKey: ['dashboardIndicators', queryParams],
    queryFn: () => indicatorApi.getDashBoardIndicators(queryParams),
  })
}
