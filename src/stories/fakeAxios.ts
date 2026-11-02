/**
 * A tiny in-memory "server" for stories: the shared axios instance is monkey-patched with
 * the handlers of the story, so the real services, hooks and components run unchanged
 * (same approach as `TaskAssignmentDialog.stories.tsx`).
 *
 * Install it synchronously during the story wrapper's first render (inside a `useState`
 * initializer), not in an effect: a child's `useQuery` fires from an effect that mounts
 * before the wrapper's own, and would otherwise lose its first request to the real,
 * backend-less axios. Call `restoreAxios` from an unmount cleanup.
 */
import type { AxiosRequestConfig } from "axios";
import axiosInstance from "../services/api/axios";

export type FakeHandler = (url: string, config?: AxiosRequestConfig, body?: unknown) => Promise<unknown>;

export interface FakeServer {
  get?: FakeHandler;
  post?: FakeHandler;
  put?: FakeHandler;
  delete?: FakeHandler;
}

// Captured once, before any story patches the shared instance, so `restoreAxios` always
// puts back the true originals whatever the mount/unmount order of stories.
const REAL_AXIOS = {
  get: axiosInstance.get.bind(axiosInstance),
  post: axiosInstance.post.bind(axiosInstance),
  put: axiosInstance.put.bind(axiosInstance),
  delete: axiosInstance.delete.bind(axiosInstance),
};

const unhandled = (method: string, url: string) => Promise.reject(new Error(`Unhandled ${method} ${url}`));

/** `{ data: { success: true, data } }`, the shape of the API's envelope inside an axios response. */
export const ok = (data: unknown) => Promise.resolve({ data: { success: true, data } });

/** A rejection shaped like an axios error with an API `message`. */
export const apiError = (status: number, message: string) =>
  Promise.reject({ isAxiosError: true, response: { status, data: { success: false, message } } });

export const installFakeServer = (server: FakeServer): void => {
  axiosInstance.get = ((url: string, config?: AxiosRequestConfig) =>
    server.get ? server.get(url, config) : unhandled("GET", url)) as typeof axiosInstance.get;
  axiosInstance.post = ((url: string, body?: unknown, config?: AxiosRequestConfig) =>
    server.post ? server.post(url, config, body) : unhandled("POST", url)) as typeof axiosInstance.post;
  axiosInstance.put = ((url: string, body?: unknown, config?: AxiosRequestConfig) =>
    server.put ? server.put(url, config, body) : unhandled("PUT", url)) as typeof axiosInstance.put;
  axiosInstance.delete = ((url: string, config?: AxiosRequestConfig) =>
    server.delete ? server.delete(url, config) : unhandled("DELETE", url)) as typeof axiosInstance.delete;
};

export const restoreAxios = (): void => {
  axiosInstance.get = REAL_AXIOS.get;
  axiosInstance.post = REAL_AXIOS.post;
  axiosInstance.put = REAL_AXIOS.put;
  axiosInstance.delete = REAL_AXIOS.delete;
};
