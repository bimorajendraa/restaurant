import http from "@/lib/http";
import { UploadImageResType } from "@/schemas/media.schema";

export const mediaApiRequest = {
  upload: (formData: FormData) =>
    http.post<UploadImageResType>("/media/upload", formData),
};
