import prisma from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { sendEmail, generateOtpEmail } from "../../utils/email";

interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, input.phone ? { phone: input.phone } : {}].filter(Boolean),
    },
  });

  if (existingUser) {
    throw new Error("User with this email or phone already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
    },
  });

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.isBlocked) {
    throw new Error("Your account has been blocked");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      isBlocked: true,
      createdAt: true,
      addresses: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("No account found with this email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, {
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendEmail({
    to: email,
    subject: "Bikroy-Mart-BD Password Reset OTP",
    html: generateOtpEmail(otp, user.name),
  });
};

export const verifyOtp = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const stored = otpStore.get(email);
  if (!stored) {
    throw new Error("No OTP found. Please request a new one.");
  }

  if (stored.expiresAt < new Date()) {
    otpStore.delete(email);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (stored.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  otpStore.delete(email);
};

interface GoogleSignInInput {
  name: string;
  email: string;
  image?: string;
  googleId: string;
}

export const googleSignIn = async (input: GoogleSignInInput) => {
  let user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (user) {
    if (user.isBlocked) {
      throw new Error("Your account has been blocked");
    }
    if (!user.avatar && input.image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: input.image },
      });
    }
  } else {
    const randomPassword = Math.random().toString(36).slice(-16);
    const hashedPassword = await hashPassword(randomPassword);
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        avatar: input.image,
        password: hashedPassword,
      },
    });
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.isBlocked) {
    throw new Error("Invalid refresh token");
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
};
