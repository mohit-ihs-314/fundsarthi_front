import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Slider } from "../../components/ui/slider";

export default function EMICalculator() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(120);

  const calculateEMI = () => {
    const P = loanAmount;

    // monthly interest rate
    const r = interestRate / 12 / 100;

    // total months
    const n = tenure;

    if (r === 0) {
      return Math.round(P / n);
    }

    const emi =
      (P * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

    return Math.round(emi);
  };

  const emi = calculateEMI();

  const totalAmount = Math.round(emi * tenure);

  const totalInterest = Math.round(totalAmount - loanAmount);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">EMI Calculator</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Loan Amount */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted-foreground">Loan Amount</label>
            <span className="text-lg">₹{loanAmount.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            value={[loanAmount]}
            onValueChange={(value) => setLoanAmount(value[0])}
            min={500000}
            max={50000000}
            step={500000}
            className="w-full"
          />
        </div>

        {/* Interest Rate */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted-foreground">Interest Rate</label>
            <span className="text-lg">{interestRate}% p.a.</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(value) => setInterestRate(value[0])}
            min={5}
            max={20}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Tenure */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted-foreground">Loan Tenure</label>
            <span className="text-lg">
              {tenure / 12} Years
            </span>
          </div>
          <Slider
            value={[tenure]}
            onValueChange={(value) => setTenure(value[0])}
            min={12}
            max={360}
            step={12}
            className="w-full"
          />
        </div>

        {/* EMI Result Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <p className="text-sm mb-2 opacity-90">Monthly EMI</p>
          <p className="text-4xl mb-1">₹{emi.toLocaleString("en-IN")}</p>
          <p className="text-sm opacity-90">
            Approx EMI for {tenure / 12} years tenure
          </p>

          <p className="text-xs text-white/70 mt-3 leading-relaxed">
            EMI may vary depending on lender interest rates & processing charges.
          </p>
        </div>

        {/* Breakdown */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Principal Amount</span>
              <span>₹{loanAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Interest</span>
              <span>₹{totalInterest.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
