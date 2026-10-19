import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../components/ui/input";
import { GradientButton } from "../../components/ui/gradient-button";
import { FundsarthiLogo } from "../../components/FundsarthiLogo";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGetOTP = async () => {

    if (mobile.length !== 10 || loading) return;

    try {

      setLoading(true);

      const res = await fetch(
        "https://api.fundsarthi.in/api/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ mobile })
        }
      );

      const data = await res.json();

      if (data.status === "success") {

        localStorage.setItem("userMobile", mobile);

        navigate("/otp");

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.error(err);
      alert("Server error");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-12">
          <FundsarthiLogo size="md" showTagline={true} />
        </div>

        {/* Login Card */}
        <div className="bg-card p-6 rounded-2xl shadow-lg">
          <p className="text-center text-muted-foreground mb-6">
            Enter your mobile number to continue
          </p>

          {/* Mobile Number Input */}
          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="
                h-12
                rounded-2xl
                border border-gray-200
                bg-white/80
                backdrop-blur
                px-4
                text-base
                shadow-sm
                transition-all duration-200
                hover:border-gray-300
                focus:border-[var(--primary)]
                focus:shadow-md
                focus:ring-4
                focus:ring-[color:var(--primary)]
                focus:ring-opacity-10
                focus:outline-none
              "
            />

            <GradientButton
              onClick={handleGetOTP}
              className="w-full h-12 rounded-2xl"
              disabled={mobile.length !== 10 || loading}
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </GradientButton>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to our{" "}
            <span className="text-primary">Terms of Service</span> and{" "}
            <span className="text-primary">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}