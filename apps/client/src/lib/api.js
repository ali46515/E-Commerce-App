import { ApiError } from "../utils/ApiError.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || "Something went wrong", response.status);
  }

  return data;
}

export const api = {
  signup: (userData) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  activateAccount: (token) => request(`/auth/activate/${token}`),

  completeAccountSetup: (setupData) =>
    request("/auth/complete-setup", {
      method: "POST",
      body: JSON.stringify(setupData),
    }),
};
