import { useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../utils/ApiError";

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const signup = async (userData) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.signup(userData);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Signup failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, data };
};
