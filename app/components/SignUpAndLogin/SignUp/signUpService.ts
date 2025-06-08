import {
  PasswordStrength,
  SignUpFormData,
  SignUpServiceParams,
  ValidationErrors,
} from "@/types/SignUp/signUp";
import { signIn } from "next-auth/react";

// Validation function
export const validateSignUpForm = (formData: SignUpFormData): ValidationErrors => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = "Password must contain uppercase, lowercase, and number";
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

// Password strength checker
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { strength: 0, text: "", color: "bg-gray-300" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  return {
    strength,
    text: levels[strength - 1] || "",
    color: colors[strength - 1] || "bg-gray-300",
  };
};

// Sign up submission handler
export const handleSignUpSubmit = async ({
  formData,
  router,
  setIsLoading,
  setErrors,
}: SignUpServiceParams): Promise<void> => {
  // Validate form
  const validationErrors = validateSignUpForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Attempt to sign in after successful signup
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callback: "/",
      });

      if (signInRes?.error) {
        setErrors({ submit: signInRes.error || "Something went wrong" });
      } else {
        // Clear any previous errors on success
        setErrors({});
        router.push("/");
      }
    } else {
      setErrors({ submit: data.message || "Something went wrong" });
    }
  } catch (error) {
    setErrors({
      submit: `Network error. Please try again. ${
        error instanceof Error ? error.message : error
      }`,
    });
  } finally {
    setIsLoading(false);
  }
};

// Alternative: Custom hook approach
export const useSignUpService = () => {
  const validateForm = (formData: SignUpFormData) => {
    return validateSignUpForm(formData);
  };

  const submitSignUp = async (params: SignUpServiceParams) => {
    return handleSignUpSubmit(params);
  };

  const checkPasswordStrength = (password: string) => {
    return getPasswordStrength(password);
  };

  return {
    validateForm,
    submitSignUp,
    checkPasswordStrength,
  };
};
