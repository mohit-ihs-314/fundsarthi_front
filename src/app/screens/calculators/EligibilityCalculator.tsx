import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Slider } from "../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GradientButton } from "../../components/ui/gradient-button";
import { Button } from "../../components/ui/button";

export default function EligibilityCalculator() {
  const navigate = useNavigate();
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [monthlyEMI, setMonthlyEMI] = useState(15000);
  const [employment, setEmployment] = useState("");

  const calculateEligibility = () => {

    const availableIncome = monthlyIncome - monthlyEMI;

    // FOIR based on employment
    let foir = 0.5;

    if (employment === "salaried") {
      foir = 0.6;
    }

    if (
      employment === "self-employed" ||
      employment === "business"
    ) {
      foir = 0.55;
    }

    // Eligible EMI
    const eligibleEMI = availableIncome * foir;

    // Interest rate
    const annualRate = 9.5;
    const monthlyRate = annualRate / 12 / 100;

    // 20 years
    const tenureMonths = 240;

    // EMI reverse calculation
    const loanAmount =
      eligibleEMI *
      ((Math.pow(1 + monthlyRate, tenureMonths) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)));

    return Math.round(loanAmount);
  };

  const eligibleAmount = employment ? calculateEligibility() : 0;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">Eligibility Calculator</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Check your estimated
            <span className="text-foreground font-medium"> Home Loan Eligibility </span>
            based on your monthly income, existing EMIs, and employment profile.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/10">
            <div className="w-2 h-2 rounded-full bg-primary" />

            <span className="text-xs font-medium text-primary">
              Approx eligibility • Instant estimate
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted-foreground">Monthly Income</label>
            <span className="text-lg">₹{monthlyIncome.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            value={[monthlyIncome]}
            onValueChange={(value) => setMonthlyIncome(value[0])}
            min={15000}
            max={500000}
            step={5000}
            className="w-full"
          />
        </div>

        {/* Monthly EMI */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted-foreground">Existing Monthly EMIs</label>
            <span className="text-lg">₹{monthlyEMI.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            value={[monthlyEMI]}
            onValueChange={(value) => setMonthlyEMI(value[0])}
            min={0}
            max={100000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Employment Type */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">
            Employment Type
          </label>
          <Select value={employment} onValueChange={setEmployment}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="self-employed">Self Employed</SelectItem>
              <SelectItem value="business">Business Owner</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {employment && (
          <>
            {/* Eligibility Result Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white mb-6 shadow-lg">
              <p className="text-sm mb-2 opacity-90">
                Estimated Home Loan Eligibility
              </p>
              <p className="text-4xl mb-1">₹{eligibleAmount.toLocaleString("en-IN")}</p>
              <p className="text-sm opacity-90">
                Approx maximum sanctioned amount
              </p>

              <p className="text-xs text-white/70 mt-3 leading-relaxed">
                Final eligibility depends on bank policies, credit score & documentation.
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-card rounded-2xl p-5 border border-border mb-6">
              <h3 className="mb-4">Calculation Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Gross Monthly Income</span>
                  <span>₹{monthlyIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Existing EMIs</span>
                  <span>₹{monthlyEMI.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Available Income</span>
                  <span>₹{(monthlyIncome - monthlyEMI).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">FOIR (50%)</span>
                  <span className="text-primary">
                    ₹{((monthlyIncome - monthlyEMI) * 0.5).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <GradientButton
              onClick={() => navigate("/loans")}
              className="w-full"
            >
              Apply for Loan
            </GradientButton>
          </>
        )}
      </div>
    </div>
  );
}