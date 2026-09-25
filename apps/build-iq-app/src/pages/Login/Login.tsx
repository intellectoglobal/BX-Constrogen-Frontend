import { useEffect, useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useOtpAuthQuery, useOtpLoginMutation } from "@igblsln/store";
import "./styles.scss";
import { useToast } from "@igblsln/control";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";

type Props = {};

const Login = (props: Props) => {
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  // const [_shouldFetchOtp, setShouldFetchOtp] = useState<boolean>(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useOtpAuthQuery(email, {
    skip: !otpEmail,
    refetchOnMountOrArgChange: true,
  });

  const [otpLogin, { isLoading: isLoggingIn }] = useOtpLoginMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGetOtp = async () => {
    if (!email.trim()) {
      showError("Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      showError("Error", "Please enter a valid email address");
      return;
    }

    // Trigger the API call
    setOtpEmail(email);
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setOtp(""); // Clear current OTP

    try {
      await refetch(); // Works now because otpEmail is not null
    } catch (err) {
      showError("Error", "Failed to resend OTP");
    } finally {
      // setIsResending(false);
    }
  };

  const handleLogin = async () => {
    if (!otp.trim()) {
      showError("Error", "Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      showError("Error", "OTP must be 6 digits");
      return;
    }

    if (!sessionId || !email) {
      showError("Error", "Session expired. Please request a new OTP");
      setOtpSent(false);
      return;
    }

    try {
      await otpLogin({
        email: email,
        session_id: sessionId,
        otp: parseInt(otp),
      }).unwrap();

      showSuccess("Success", "Login successful!");
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Login failed. Please try again.";
      showError("Error", errorMessage);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp("");
    setSessionId("");
    setOtpEmail(null); // This disables the query
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  useEffect(() => {
    if (data && data?.Status?.toLowerCase() === "success") {
      setOtpSent(true);
      setSessionId(data?.Details || "");
      showSuccess("Success", data?.message || "OTP sent successfully!");
    }
  }, [data, showSuccess]);


  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as any)?.data?.message || "Failed to send OTP";
      showError("Error", errorMessage);
      // setShouldFetchOtp(false); // Reset the trigger on error
    }
  }, [error, showError]);

  return (
    <div className="ig-login">
      <div className="login-container">
        <div className="login-wrapper">
          <div className="surface-card">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mb-4 transition-all duration-300 hover:scale-105">
                <img
                  src="/assets/img/logo-no-bg.png"
                  alt="logo"
                  height="100"
                  className="mb-3"
                />
              </div>
              <div className="text-900 text-3xl md:text-4xl font-bold mb-2 text-primary">
                Constrogen
              </div>
              <div className="text-700 font-medium mb-4">
                {otpSent ? "Enter verification code" : "Welcome back!"}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Email Step */}
              {!otpSent && (
                <div className="animate-fadein">
                  <label
                    htmlFor="email"
                    className="block text-900 font-semibold mb-2"
                  >
                    Email Address
                  </label>
                  <div className="p-input-icon-right w-full mb-4">
                    {isLoading && (
                      <i className="pi pi-spin pi-spinner text-primary" />
                    )}
                    <InputText
                      id="email"
                      type="email"
                      className="w-full p-3 text-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleGetOtp)}
                    //   autoFocus
                    />
                  </div>
                  <Button
                    label="Send OTP"
                    icon="pi pi-send"
                    onClick={handleGetOtp}
                    className="w-full p-3 text-lg font-semibold"
                    loading={isLoading}
                    disabled={!email.trim() || isLoading}
                  />
                </div>
              )}

              {/* OTP Step */}
              {otpSent && (
                <div className="animate-fadein">
                  {/* Email confirmation */}
                  <div className="mb-4 p-3 bg-blue-50 border-round text-center">
                    <div className="text-sm text-700 mb-1">OTP sent to:</div>
                    <div className="font-semibold text-900">{email}</div>
                    <Button
                      label="Change email"
                      className="p-button-text p-button-sm mt-2"
                      onClick={handleBackToEmail}
                    />
                  </div>

                  <label
                    htmlFor="otp"
                    className="block text-900 font-semibold mb-2"
                  >
                    Verification Code
                  </label>
                  <Password
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    toggleMask={false}
                    feedback={false}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full mb-4"
                    inputClassName="w-full p-3 text-lg text-center tracking-widest"
                    onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                    autoFocus
                  />

                  {/* Action buttons */}
                  <div className="flex flex-column gap-3">
                    <Button
                      label="Verify & Sign In"
                      icon="pi pi-check"
                      onClick={handleLogin}
                      className="w-full p-3 text-lg font-semibold"
                      loading={isLoggingIn}
                      disabled={!otp.trim() || otp.length !== 6 || isLoggingIn}
                    />

                    <Button
                      label={isResending ? "Sending..." : "Resend OTP"}
                      icon={
                        isResending ? "pi pi-spin pi-spinner" : "pi pi-refresh"
                      }
                      className="p-button-outlined w-full p-2 resend-btn"
                      onClick={handleResendOtp}
                      loading={isResending}
                      disabled={isResending}
                    />
                  </div>

                  <div className="text-center mt-4 text-sm text-700 help-text">
                    {isResending ? (
                      <div className="flex align-items-center justify-content-center gap-2">
                        <i className="pi pi-spin pi-spinner text-primary"></i>
                        <span>Sending new OTP...</span>
                      </div>
                    ) : (
                      "Didn't receive the code? Check your spam folder or try resending."
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;