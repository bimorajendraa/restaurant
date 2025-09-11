import accountApiRequest from "@/apiRequests/account";
import { useQuery } from "@tanstack/react-query";

export const useQueryAccount = () => {
  return useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApiRequest.me,
  });
};
