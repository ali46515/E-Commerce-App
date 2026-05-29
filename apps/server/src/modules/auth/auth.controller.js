import { AuthService } from "./auth.service.js";

import { ApiResponse } from "../../utils/responses/ApiResponse.js";

import { asyncHandler } from "../../utils/responses/asyncHandler.js";

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "../../utils/cookies/cookieOptions.js";

export class AuthController {
  static registerBuyer = asyncHandler(async (req, res) => {
    const result = await AuthService.registerBuyer({
      ...req.body,
      ipAddress: req.ip,
      deviceInfo: req.headers["user-agent"],
    });

    res
      .cookie("accessToken", result.accessToken, accessCookieOptions)
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
      .status(201)
      .json(
        new ApiResponse({
          message: "Buyer registered successfully",

          data: {
            user: result.user,
          },
        }),
      );
  });

  static login = asyncHandler(async (req, res) => {
    const result = await AuthService.login({
      ...req.body,
      ipAddress: req.ip,
      deviceInfo: req.headers["user-agent"],
    });

    res
      .cookie("accessToken", result.accessToken, accessCookieOptions)
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
      .status(200)
      .json(
        new ApiResponse({
          message: "Login successful",

          data: {
            user: result.user,
          },
        }),
      );
  });

  static logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    await AuthService.logout(req.user._id, refreshToken);

    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(
        new ApiResponse({
          message: "Logout successful",
        }),
      );
  });
}
