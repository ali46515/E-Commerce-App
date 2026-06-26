import { useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../utils/ApiError";

export const useAccountSetup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const completeSetup = async (setupData) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.completeAccountSetup(setupData);

      if (response.tokens) {
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);
      }

      return response.data;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Account setup failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completeSetup, loading, error };
};
