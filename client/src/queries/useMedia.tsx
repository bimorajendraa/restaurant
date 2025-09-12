import { mediaApiRequest } from "@/apiRequests/media";
import { useMutation } from "@tanstack/react-query";

export const uploadMediaMutation = () => {
  return useMutation({
    mutationFn: (formData: FormData) => mediaApiRequest.upload(formData),
  });
};
