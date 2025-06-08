import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface LoginServiceParams {
  formData: LoginFormData;
  callbackUrl?: string;
  router: AppRouterInstance;
  setIsLoading: (loading: boolean) => void;
  setErrors: (errors: ValidationErrors) => void;
}
