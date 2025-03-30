import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState(""); 
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail } = useAuthStore();

  useEffect(() => {
    if (error) {
      setErrorMessage(error); 
    }
  }, [error]);

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const nextIndex = newCode.findIndex((digit) => digit === "");
      if (nextIndex !== -1) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.some((digit) => !digit)) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }

    setErrorMessage(""); 
    const verificationCode = code.join("");

    try {
      await verifyEmail(verificationCode);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Verification failed");
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
              <p className="text-base-content/60">Enter the 6-digit code sent to your email.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold bg-gray-200 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              ))}
            </div>

            {errorMessage && <p className="text-red-500 font-semibold text-center">{errorMessage}</p>}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || code.some((digit) => !digit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

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

      <AuthImagePattern
        title="Email Verification"
        subtitle="Enter the code sent to your email to activate your account."
      />
    </div>
  );
};

export default EmailVerificationPage;
