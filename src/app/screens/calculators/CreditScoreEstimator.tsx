import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GradientButton } from "../../components/ui/gradient-button";
import { Button } from "../../components/ui/button";
import GaugeChart from "react-gauge-chart";

export default function CreditScoreEstimator() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "otp" | "result">("form");
  const [otp, setOtp] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFallback, setIsFallback] = useState(false);

  const [formData, setFormData] = useState({
    mobile: "",
    pan: "",
    firstname: "",
    lastname: "",
    email: "",
    dob: "",
    address: "",
    pincode: "",
    stateCode: "",
    income: "",
    defaults: "",
  });

  const states = [
    { name: "Andhra Pradesh", code: "37" },
    { name: "Arunachal Pradesh", code: "12" },
    { name: "Assam", code: "18" },
    { name: "Bihar", code: "10" },
    { name: "Chhattisgarh", code: "22" },
    { name: "Goa", code: "30" },
    { name: "Gujarat", code: "24" },
    { name: "Haryana", code: "6" },
    { name: "Himachal Pradesh", code: "2" },
    { name: "Jharkhand", code: "20" },
    { name: "Karnataka", code: "29" },
    { name: "Kerala", code: "32" },
    { name: "Madhya Pradesh", code: "23" },
    { name: "Maharashtra", code: "27" },
    { name: "Manipur", code: "14" },
    { name: "Meghalaya", code: "17" },
    { name: "Mizoram", code: "15" },
    { name: "Nagaland", code: "13" },
    { name: "Odisha", code: "21" },
    { name: "Punjab", code: "3" },
    { name: "Rajasthan", code: "8" },
    { name: "Sikkim", code: "11" },
    { name: "Tamil Nadu", code: "33" },
    { name: "Telangana", code: "36" },
    { name: "Tripura", code: "16" },
    { name: "Uttar Pradesh", code: "9" },
    { name: "Uttarakhand", code: "5" },
    { name: "West Bengal", code: "19" },

    // Union Territories (important for real users)
    { name: "Delhi", code: "7" },
    { name: "Jammu & Kashmir", code: "1" },
    { name: "Ladakh", code: "38" },
    { name: "Chandigarh", code: "4" },
    { name: "Puducherry", code: "34" },
    { name: "Andaman & Nicobar Islands", code: "35" },
    { name: "Dadra & Nagar Haveli and Daman & Diu", code: "26" },
    { name: "Lakshadweep", code: "31" },
  ];

  const sortedStates = [...states].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // ---------------- SEND OTP ----------------
  const sendOtp = async () => {
    setError("");

    if (formData.mobile.length !== 10) {
      setError("Enter valid mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.fundsarthi.in/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setStep("otp");  // ✅ FIXED
      } else {
        setError(data.message || "OTP failed");
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setLoading(false);
  };

  // ---------------- VERIFY + CIBIL ----------------
  const verifyOtpAndFetchScore = async () => {
    setError("");

    if (!otp) {
      setError("Enter OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.fundsarthi.in/api/check-cibil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.mobile,
          otp,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          dob: formData.dob,
          address: formData.address,
          pincode: formData.pincode,
          stateCode: formData.stateCode,
          pan: formData.pan,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setScore(data.score);
        setIsFallback(data.fallback || false);
        setStep("result");
      } else {
        setError(data.message || "Failed to fetch score");
      }
    } catch {
      setError("API error");
    }

    setLoading(false);
  };

  // ---------------- SCORE CATEGORY ----------------
  const getScoreCategory = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 650) return { label: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 550) return { label: "Fair", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-100" };
  };

  return (
    <div className="h-full flex flex-col bg-background">

      {/* HEADER */}
      <div className="px-6 py-4 bg-card border-b flex items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">Credit Score Checker</h1>
      </div>

      <div className="flex-1 px-6 py-6">

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}

        {/* ---------------- FORM ---------------- */}
        {step === "form" && (
          <>
            <div className="space-y-4">

              <Input placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })
                }
              />

              <Input placeholder="First Name"
                value={formData.firstname}
                onChange={(e) =>
                  setFormData({ ...formData, firstname: e.target.value })
                }
              />

              <Input placeholder="Last Name"
                value={formData.lastname}
                onChange={(e) =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
              />

              <Input placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Input placeholder="DOB (DDMMYYYY)"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />

              <Input placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <Input placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
              />

              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, stateCode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {sortedStates.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input placeholder="PAN"
                value={formData.pan}
                onChange={(e) =>
                  setFormData({ ...formData, pan: e.target.value.toUpperCase() })
                }
              />

            </div>

            <GradientButton
              onClick={sendOtp}
              className="w-full mt-6"
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </GradientButton>
          </>
        )}

        {/* ---------------- OTP ---------------- */}
        {step === "otp" && (
          <div className="space-y-4">
            <h2 className="text-center font-semibold">Enter OTP</h2>

            <Input
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <GradientButton
              onClick={verifyOtpAndFetchScore}
              className="w-full"
            >
              {loading ? "Checking..." : "Verify & Check Score"}
            </GradientButton>

            <Button onClick={() => setStep("form")} variant="outline">
              Back
            </Button>
          </div>
        )}

        {/* ---------------- RESULT ---------------- */}
        {step === "result" && score && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow mb-6 text-center">

              {/* 🔥 FALLBACK MESSAGE */}
              {isFallback && (
                <div className="mb-4 text-sm bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
                  ⚠ Showing estimated score (CIBIL service unavailable)
                </div>
              )}

              {/* SPEEDOMETER */}
              <GaugeChart
                id="credit-score-gauge"
                nrOfLevels={30}
                percent={score / 900}
                colors={["#ef4444", "#f97316", "#3b82f6", "#22c55e"]}
                arcWidth={0.3}
                textColor="#000"
              />

              {/* SCORE */}
              <div className="mt-4 text-4xl font-bold">{score}</div>
              <div className="text-sm text-gray-500">out of 900</div>

              {/* CATEGORY */}
              <div className={`mt-3 px-4 py-2 rounded-full inline-block ${getScoreCategory(score).bg} ${getScoreCategory(score).color}`}>
                {getScoreCategory(score).label}
              </div>

            </div>

            <GradientButton onClick={() => navigate("/loans")} className="w-full">
              Apply for Loan
            </GradientButton>

            <Button
              onClick={() => {
                setStep("form");
                setScore(null);
                setIsFallback(false); // reset
              }}
              className="w-full mt-3"
            >
              Try Again
            </Button>
          </>
        )}

      </div>
    </div>
  );
}