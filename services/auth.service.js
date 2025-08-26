import crypto from "crypto";
import User from "../models/user.model.js";
import EmailOtpVerification from "../models/otp.model.js";
import { generateAccessToken, generateRefreshToken } from "../utlis/tokenService.js";

function generateTempPassword(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[crypto.randomInt(0, chars.length)];
  return out;
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export async function register(payload) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    state,
    pinCode,
    termsAccepted,
  } = payload;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !address ||
    !state ||
    !pinCode
  ) {
    throw new Error("Missing required fields");
  }

  if (termsAccepted !== true) {
    throw new Error("Terms must be accepted");
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existing) {
    throw new Error("Email already registered");
  }

  const tempPassword = generateTempPassword(8);
  const placeholderPassword = crypto.randomBytes(16).toString("hex");

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: phoneNumber.trim(),
    address: address.trim(),
    state: state.trim(),
    pinCode: pinCode.trim(),
    password: placeholderPassword,
    tempPassword,
    tempPasswordUsed: false,
    termsAccepted: true,
    emailVerified: true,
    type: "user",
  });

  user.type="user";
  await user.save();
  const payloadToken = { id: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(payloadToken);
  const refreshToken = generateRefreshToken(payloadToken);

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    address: user.address,
    state: user.state,
    pinCode: user.pinCode,
    emailVerified: true,
    tempPassword,
    createdAt: user.createdAt,
    accessToken,
    refreshToken,
    type: user.type || "user",
  };
}

export async function login({ email, password }) {
  if (!email || !password) throw new Error("Missing credentials");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new Error("Invalid credentials");
  console.log(user.tyoe);
  if(user.type){
    if(user.type=="admin"){
    const payloadToken = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payloadToken);
    const refreshToken = generateRefreshToken(payloadToken);
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      state: user.state,
      pinCode: user.pinCode,
      emailVerified: user.emailVerified,
      usedTempPassword: false,
      accessToken,
      refreshToken,
      type: user.type || "user",
    };
    }

  }

  if (!user.tempPasswordUsed && user.tempPassword && password === user.tempPassword) {
    user.tempPasswordUsed = true;
    await user.save();
    const payloadToken = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payloadToken);
    const refreshToken = generateRefreshToken(payloadToken);
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      state: user.state,
      pinCode: user.pinCode,
      emailVerified: user.emailVerified,
      usedTempPassword: true,
      message: "Temporary password used. Use forgot password to generate a new one.",
      accessToken,
      refreshToken,
      type: user.type || "admin",
    };
  }

  if (password === user.password) {
    const payloadToken = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payloadToken);
    const refreshToken = generateRefreshToken(payloadToken);
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      state: user.state,
      pinCode: user.pinCode,
      emailVerified: user.emailVerified,
      usedTempPassword: false,
      accessToken,
      refreshToken,
      type: user.type || "user",
    };
  }

  if (user.tempPasswordUsed && user.tempPassword && password === user.tempPassword) {
    throw new Error("Temporary password already used. Use forgot password.");
  }

  throw new Error("Invalid credentials");
}

export async function startForgotPassword({ email }) {
  if (!email) throw new Error("Email required");
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new Error("No account found");
  const verificationId = crypto.randomUUID();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await EmailOtpVerification.create({
    verificationId,
    email: user.email,
    otp,
    expiresAt,
    used: false,
  });
  return { verificationId, otp };
}

export async function verifyForgotPassword({ verificationId, otp }) {
  if (!verificationId || !otp) throw new Error("Missing verification");
  const rec = await EmailOtpVerification.findOne({ verificationId });
  if (!rec) throw new Error("Invalid verification");
  if (rec.expiresAt < new Date()) throw new Error("OTP expired");
  if (rec.otp !== otp) throw new Error("Invalid OTP");
  const user = await User.findOne({ email: rec.email });
  if (!user) throw new Error("No account found");
  user.tempPasswordUsed = true;
  rec.used = true;
  await rec.save();
  await user.save();
  return { email: user.email };
}

export async function resetPassword({ email, newPassword }) {
  if (!email || !newPassword) throw new Error("Missing fields");
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new Error("No account found");
  const rec = await EmailOtpVerification.findOne({ email: user.email, used: true }).sort({ expiresAt: -1 });
  if (!rec) throw new Error("OTP verification required");
  if (rec.expiresAt < new Date()) throw new Error("OTP expired");
  if (!rec.used) throw new Error("OTP not verified");
  user.password = newPassword;
  await user.save();
  return { email: user.email };
}

export async function verifyEmailOtp({ verificationId, otp }) {
  if (!verificationId || !otp) throw new Error("Missing verification");
  const rec = await EmailOtpVerification.findOne({ verificationId });
  if (!rec) throw new Error("Invalid verification");
  if (rec.expiresAt < new Date()) throw new Error("OTP expired");
  if (rec.otp !== otp) throw new Error("Invalid OTP");
  await EmailOtpVerification.deleteOne({ _id: rec._id });
  return { email: rec.email, emailVerified: true };
}

export async function sendEmailOtp({ email }) {
  if (!email) throw new Error("Email required");
  const verificationId = crypto.randomUUID();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await EmailOtpVerification.create({
    verificationId,
    email: email,
    otp,
    expiresAt,
    used: false,
  });
  return { verificationId, otp };
}
function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Fetch all users with optional search and pagination.
 * @param {Object} opts
 * @param {number} [opts.page=1]      - 1-based page number
 * @param {number} [opts.limit=20]    - page size (max 100)
 * @param {string} [opts.search]      - case-insensitive search across name/email/phone
 * @param {string} [opts.sort='-createdAt'] - Mongoose sort string (e.g. 'firstName' or '-createdAt')
 */
export async function fetchAllUsers({
  page = 1,
  limit = 20,
  search,
  sort = "-createdAt",
} = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim()), "i");
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { phoneNumber: rx },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      // exclude sensitive fields explicitly
      .select(
        "firstName lastName email phoneNumber address state pinCode emailVerified createdAt updatedAt"
      )
      .lean(),
    User.countDocuments(filter),
  ]);

  const users = items.map((u) => ({
    id: u._id.toString(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    address: u.address,
    state: u.state,
    pinCode: u.pinCode,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    users,
  };
}