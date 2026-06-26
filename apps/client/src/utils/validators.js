import { VALIDATION } from "./constants";

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!VALIDATION.EMAIL_REGEX.test(email))
    return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH)
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
  return "";
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "";
  if (!VALIDATION.PHONE_REGEX.test(phone))
    return "Please enter a valid phone number";
  return "";
};
