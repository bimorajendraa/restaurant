import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/schemas/auth.schema";

const authApiRequests = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body), // server backend của dự án
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
  // gọi tới server trung gian của nextjs
};

export default authApiRequests;
