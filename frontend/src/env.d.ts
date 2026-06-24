/// <reference path="../.astro/types.d.ts" />
declare const BACKEND_URL: string;

interface Window {
  showStatusAlert: (
    status: number,
    customFriendlyMsg?: string | null,
    backendMsg?: any | null,
    isSuccess?: boolean,
    callback?: (() => void) | null
  ) => void;
}