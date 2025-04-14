import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, isResettingPassword } = useAuthStore(); // Removed `error`
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(token, password);
      setTimeout(() => navigate("/login"), 2000); // ✅ Only redirect, no extra toast
    } catch (error) {
      console.error("Password Reset Error:", error);
      
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
              <p className="text-base-content/60">
                Enter a new password below to reset your account.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input input-bordered w-full pl-10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="link link-primary flex justify-center items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Reset Your Password"
        subtitle="Choose a strong and secure password for your account."
      />
    </div>
  );
};

export default ResetPasswordPage;
