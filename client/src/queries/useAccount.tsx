import accountApiRequest from '@/apiRequests/account'
import { queryClient } from '@/components/app-provider'
import { UpdateEmployeeAccountBodyType } from '@/schemas/account.schema'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAccountMeQuery = () => {
  return useQuery({
    queryKey: ['account-me'],
    queryFn: accountApiRequest.getMe,
  })
}

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.changePassword,
  })
}

export const useAccountListQuery = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountApiRequest.getListAccount,
  })
}

export const useGetEmployeeDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => accountApiRequest.getEmployeeDetail(id),
    enabled,
  })
}

export const useCreateEmployeeAccountMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useUpdateEmployeeAccountMutation = (id: number) => {
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & UpdateEmployeeAccountBodyType) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useDeleteEmployeeAccountMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
