import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { GradientButton } from "../../components/ui/gradient-button";
import { ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { requestLocation } from "../../utils/location";
import { initNotifications } from "../../services/notification";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();

  // ⏱️ Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [canResend]);

  // 🔐 Verify OTP
  const handleVerify = async () => {

    if (otp.length !== 6) return;

    const mobile = localStorage.getItem("userMobile");

    if (!mobile) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    try {

      const res = await fetch(
        "https://api.fundsarthi.in/api/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {

        localStorage.setItem("userMobile", mobile);

        localStorage.setItem(
          "isLoggedIn",
          "true"
        );

        await requestLocation();
        initNotifications();

        // Check whether this user already has a complete profile so we
        // can route new users into profile completion before Home.
        let isProfileComplete = false;

        try {
          const profileRes = await fetch(
            `https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`
          );
          const profileData = await profileRes.json();

          if (profileData.status === "success") {
            localStorage.setItem("user", JSON.stringify(profileData.data));
            isProfileComplete = !!(
              profileData.data?.name &&
              profileData.data?.city &&
              profileData.data?.employment
            );
          }
        } catch (profileErr) {
          console.error(profileErr);
        }

        navigate(isProfileComplete ? "/home" : "/profile", {
          replace: true,
        });

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.error(err);
      alert("Server error");

    }
  };

  // 🔁 Resend OTP
  const handleResend = async () => {
    const mobile = localStorage.getItem("userMobile");

    try {
      const res = await fetch("https://api.fundsarthi.in/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mobile })
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("OTP resent successfully");

        // reset timer
        setTimer(30);
        setCanResend(false);
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.error(err);
      alert("Error resending OTP");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-2xl mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your mobile number
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <GradientButton
            onClick={handleVerify}
            className="w-full"
            disabled={otp.length !== 6}
          >
            Verify OTP
          </GradientButton>

          {/* 🔁 Resend Section */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend OTP in {timer}s
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}