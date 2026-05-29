import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../users/user.model.js";

import { ApiError } from "../../utils/responses/ApiError.js";

import { generateAccessToken } from "../../utils/jwt/generateAccessToken.js";

import { generateRefreshToken } from "../../utils/jwt/generateRefreshToken.js";

import { hashToken } from "../../utils/crypto/hashToken.js";

export class AuthService {
  static async registerBuyer(payload) {
    const existingUser = await User.findOne({
      email: payload.email,
    });

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      passwordHash,
      role: "BUYER",
    });

    const sessionId = crypto.randomUUID();

    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      sessionId,
    });

    user.refreshTokens.push({
      tokenHash: hashToken(refreshToken),
      deviceInfo: payload.deviceInfo,
      ipAddress: payload.ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async login(payload) {
    const user = await User.findOne({
      email: payload.email,
    }).select("+passwordHash");

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.isSuspended) {
      throw new ApiError(403, "Account suspended");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      await user.save();

      throw new ApiError(401, "Invalid credentials");
    }

    user.failedLoginAttempts = 0;

    const sessionId = crypto.randomUUID();

    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      sessionId,
    });

    user.refreshTokens.push({
      tokenHash: hashToken(refreshToken),
      deviceInfo: payload.deviceInfo,
      ipAddress: payload.ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    user.lastLoginAt = new Date();

    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async logout(userId, refreshToken) {
    const tokenHash = hashToken(refreshToken);

    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          refreshTokens: {
            tokenHash,
          },
        },
      },
    );
  }
}
