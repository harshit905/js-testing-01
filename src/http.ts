// Typed axios client. `AxiosTransformer` was REMOVED in axios 1.0 (split into AxiosRequestTransformer / AxiosResponseTransformer).
import axios, { AxiosRequestConfig, AxiosTransformer } from "axios";

const stamp: AxiosTransformer = (data) => ({ ...(data as object), stampedAt: Date.now() });

export function client(baseURL: string) {
  const config: AxiosRequestConfig = {
    baseURL,
    timeout: 5000,
    transformRequest: [stamp],
  };
  return axios.create(config);
}

export async function get(url: string): Promise<unknown> {
  const response = await client("https://example.invalid").get(url);
  return response.data;
}
