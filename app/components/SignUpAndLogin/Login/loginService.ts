import {
  LoginFormData,
  LoginServiceParams,
  ValidationErrors,
} from "@/types/Login/login";
import { signIn } from "next-auth/react";

// Validation function
export const validateLoginForm = (formData: LoginFormData): ValidationErrors => {
  const errors: Record<string, string> = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Please enter your password";
  }

  return errors;
};

// Login submission handler
export const handleLoginSubmit = async ({
  formData,
  callbackUrl,
  router,
  setIsLoading,
  setErrors,
}: LoginServiceParams): Promise<void> => {
  // Validate form
  const validationErrors = validateLoginForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl,
    });

    if (res?.error) {
      setErrors({ submit: res.error || "Something went wrong" });
    } else {
      // Clear any previous errors on success
      setErrors({});
      router.push("/");
    }
  } catch (error) {
    setErrors({
      submit:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  } finally {
    setIsLoading(false);
  }
};
