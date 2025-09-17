import http from '@/lib/http'
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from '@/schemas/account.schema'

const PREFIX_ACCOUNT = '/accounts'

const accountApiRequest = {
  getMe: () => http.get<AccountResType>(`${PREFIX_ACCOUNT}/me`),

  sGetMe: (accessToken: string) =>
    http.get<AccountResType>(`${PREFIX_ACCOUNT}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>(`${PREFIX_ACCOUNT}/me`, body),

  changePassword: (body: ChangePasswordBodyType) => http.put<AccountResType>(`${PREFIX_ACCOUNT}/change-password`, body),

  getListAccount: () => http.get<AccountListResType>(`${PREFIX_ACCOUNT}`),

  createEmployee: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>(PREFIX_ACCOUNT, body),

  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${PREFIX_ACCOUNT}/detail/${id}`, body),

  getEmployeeDetail: (id: number) => http.get<AccountResType>(`${PREFIX_ACCOUNT}/detail/${id}`),

  deleteEmployee: (id: number) => http.delete<AccountResType>(`${PREFIX_ACCOUNT}/detail/${id}`),
}

export default accountApiRequest
