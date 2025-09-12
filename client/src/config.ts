import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  DOCKER_PUBLIC_API_ENDPOINT: z.string().optional(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  DOCKER_PUBLIC_API_ENDPOINT: process.env.DOCKER_PUBLIC_API_ENDPOINT,
});

if (!configProject.success) {
  console.error(configProject.error.errors);
  throw new Error("It is a error with check schema");
}

const envConfig = configProject.data;

export default envConfig;
