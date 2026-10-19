import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Compass, ArrowLeft } from "lucide-react";

export default function ConsultantLogin() {
  const [mobile, setMobile] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleGetOTP = () => {
    if (mobile.length === 10) {
      setShowOTP(true);
    }
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      navigate("/consultant/dashboard");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 flex items-center">
        <button onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl text-foreground mb-2">Consultant Portal</h1>
            <p className="text-muted-foreground text-center">
              Login to manage your consultations
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-card p-6 rounded-2xl shadow-lg">
            {!showOTP ? (
              <>
                <h2 className="text-xl mb-2">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your registered mobile number
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <Button
                    onClick={handleGetOTP}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
                    disabled={mobile.length !== 10}
                  >
                    Get OTP
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl mb-2">Verify OTP</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the 6-digit code sent to {mobile}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      OTP
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-12 rounded-xl text-center text-xl tracking-widest"
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
                    disabled={otp.length !== 6}
                  >
                    Verify & Login
                  </Button>

                  <div className="text-center">
                    <button className="text-sm text-primary hover:underline">
                      Resend OTP
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
