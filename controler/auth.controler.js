// controllers/auth.controller.js
import {
  register,
  login,
  startForgotPassword,
  verifyForgotPassword,
  resetPassword,
  verifyEmailOtp,
  sendEmailOtp,
  fetchAllUsers,
} from "../services/auth.service.js";

export async function registerController(req, res) {
  try {
    const data = await register(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function loginController(req, res) {
  try {
    const data = await login(req.body);
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
}

export async function sendEmailOtpController(req, res) {
  try {
    const data = await sendEmailOtp({ email: req.body.email });
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function verifyEmailOtpController(req, res) {
  try {
    const data = await verifyEmailOtp({
      verificationId: req.body.verificationId,
      otp: req.body.otp,
    });
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function startForgotPasswordController(req, res) {
  try {
    const data = await startForgotPassword({ email: req.body.email });
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function verifyForgotPasswordController(req, res) {
  try {
    const data = await verifyForgotPassword({
      verificationId: req.body.verificationId,
      otp: req.body.otp,
    });
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function resetPasswordController(req, res) {
  try {
    const data = await resetPassword({
      email: req.body.email,
      newPassword: req.body.newPassword,
    });
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}


export async function getUsers(req, res) {
  try {
    const { page, limit, search, sort } = req.query;
    const data = await fetchAllUsers({ page, limit, search, sort });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}