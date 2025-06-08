import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface PasswordStrength {
  strength: number;
  text: string;
  color: string;
}

export interface SignUpServiceParams {
  formData: SignUpFormData;
  router: AppRouterInstance;
  setIsLoading: (loading: boolean) => void;
  setErrors: (errors: ValidationErrors) => void;
}
