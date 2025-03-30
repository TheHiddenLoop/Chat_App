import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendEmail } from "../lib/email.js";
import dotenv from "dotenv";
import { resetPasswordTemplate, successResetTemplate, emailVerificationTemplate } from "../lib/emailTemplates.js"; //Use imported templates

export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: "User already exists and is verified" });
      }

      // If user exists but is not verified, update their data with new details
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      existingUser.password = hashedPassword;
      existingUser.fullName = fullName;
      existingUser.verificationToken = verificationCode;
      existingUser.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000;
      existingUser.isVerified = false;

      await existingUser.save();

      const emailContent = emailVerificationTemplate(verificationCode);
      await sendEmail(email, "Verify Your Email - Chatty", emailContent);
    } else {
      // Create new user if not found
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      existingUser = new User({
        email,
        password: hashedPassword,
        fullName,
        verificationToken: verificationCode,
        verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
        isVerified: false,
      });

      await existingUser.save();

      const emailContent = emailVerificationTemplate(verificationCode);
      await sendEmail(email, "Verify Your Email - Chatty", emailContent);
    }

    setTimeout(async () => {
      const user = await User.findOne({ email });
      if (user && !user.isVerified && Date.now() > user.verificationTokenExpiresAt) {
        await User.deleteOne({ email });
        console.log(`User ${email} deleted due to unverified email.`);
      }
    }, 15 * 60 * 1000);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for the verification code.",
    });

  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });

  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,  
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//chnages


dotenv.config();

const generateToken2 = () => {
  return [...Array(30)].map(() => Math.random().toString(36)[2]).join("");
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = generateToken2();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1-hour expiration
    await user.save();

    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ message: "FRONTEND_URL is not set in .env file" });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log("Generated Reset Link:", resetLink);

    await sendEmail(user.email, "Password Reset Request", resetPasswordTemplate(resetLink));

    res.json({ message: "Password reset link sent to your email" });

  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await sendEmail(user.email, "Password Reset Successful", successResetTemplate());

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
