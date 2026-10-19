import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { GradientButton } from "../../components/ui/gradient-button";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft, Lock, Edit2 } from "lucide-react";

const OPTIONAL_FIELDS = ["gst", "creditCardDue", "notes"];

const amountOptions = [
  "Upto 5 L",
  "5 to 10 L",
  "10 to 15 L",
  "15 to 20 L",
  "20 to 50 L",
  "50 to 1 Cr",
  "1 Cr +",
];

// Every field a step can reference, plus how to render/validate it.
const fieldMeta: Record<string, any> = {
  employmentType: {
    label: "Employment Type",
    type: "select",
    options: [
      { value: "salaried", label: "Salaried" },
      { value: "self-employed", label: "Self-Employed Professional" },
      { value: "business-owner", label: "Business Owner" },
    ],
  },
  propertyType: {
    label: "Property Type",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "resale", label: "Resale" },
    ],
  },
  projectName: {
    label: "Project / Society Name",
    type: "text",
    placeholder: "Enter project or society name",
  },
  propertyLocation: {
    label: "Property Location",
    type: "text",
    placeholder: "Enter property address / locality",
  },
  propertyValue: {
    label: "Property Value",
    type: "text",
    numeric: true,
    placeholder: "Enter estimated property value",
  },
  // incomeType: {
  //   label: "Income Type",
  //   type: "select",
  //   options: [
  //     { value: "salaried", label: "Salaried" },
  //     { value: "self-employed", label: "Self-Employed" },
  //   ],
  // },
  salary: {
    label: "Net Monthly Income",
    type: "text",
    numeric: true,
    placeholder: "Enter net monthly income",
  },
  companyName: {
    label: "Company Name",
    type: "text",
    placeholder: "Enter your employer's name",
  },
  creditCardDue: {
    label: "Credit Card Due (if any)",
    type: "text",
    numeric: true,
    placeholder: "Enter outstanding credit card due, or leave blank",
  },
  businessType: {
    label: "Business Type",
    type: "text",
    placeholder: "e.g. Retail, Manufacturing, Services",
  },
  turnover: {
    label: "Annual Turnover",
    type: "text",
    numeric: true,
    placeholder: "Enter annual turnover",
  },
  gst: {
    label: "GST Number (if applicable)",
    type: "text",
    placeholder: "Enter GST number, or leave blank",
  },
  requirementType: {
    label: "Requirement Type",
    type: "select",
    options: [
      { value: "secured", label: "Secured" },
      { value: "unsecured", label: "Unsecured" },
    ],
  },
  entityType: {
    label: "Entity Type",
    type: "select",
    options: [
      { value: "proprietorship", label: "Proprietorship" },
      { value: "partnership", label: "Partnership" },
      { value: "pvt-ltd", label: "Private Limited" },
      { value: "llp", label: "LLP" },
    ],
  },
  businessName: {
    label: "Business Name",
    type: "text",
    placeholder: "Enter registered business name",
  },
  amount: {
    label: "Loan Amount",
    type: "select",
    options: amountOptions.map((a) => ({ value: a, label: a })),
  },
  existingEmi: {
    label: "Existing EMI (if any)",
    type: "text",
    numeric: true,
    placeholder: "Enter existing EMI, or 0",
  },
  notes: {
    label: "Additional Notes (Optional)",
    type: "textarea",
    placeholder: "Any specific requirements or information",
  },
};

// Per loan-type step definitions. "applicant" is a special key rendered as the
// auto-filled Full Name / locked Mobile block instead of a fieldMeta lookup.
const loanStepsConfig: Record<string, { title: string; fields: string[] }[]> = {
  home: [
    { title: "Applicant Details", fields: ["applicant", "employmentType"] },
    { title: "Property Details", fields: ["propertyType", "projectName", "propertyLocation"] },
    { title: "Income & Financial Details", fields: ["incomeType", "salary", "amount", "existingEmi", "notes"] },
  ],
  lap: [
    { title: "Applicant / Business Details", fields: ["applicant", "businessType"] },
    { title: "Property Details", fields: ["propertyType", "propertyValue", "propertyLocation"] },
    { title: "Existing Loan & Financial Details", fields: ["existingEmi", "incomeType", "salary"] },
    { title: "Loan Requirement", fields: ["amount", "requirementType", "notes"] },
  ],
  personal: [
    { title: "Applicant Details", fields: ["applicant", "companyName"] },
    { title: "Financial Details", fields: ["salary", "creditCardDue", "amount", "existingEmi", "notes"] },
  ],
  corporate: [
    { title: "Applicant Details", fields: ["applicant", "entityType"] },
    { title: "Financial Details", fields: ["turnover", "requirementType", "amount", "existingEmi", "notes"] },
  ],
  business: [
    { title: "Applicant Details", fields: ["applicant", "businessType"] },
    { title: "Financial Details", fields: ["turnover", "gst", "amount", "existingEmi", "notes"] },
  ],
  msme: [
    { title: "Applicant Details", fields: ["applicant", "entityType", "businessName"] },
    { title: "Financial Details", fields: ["turnover", "amount", "existingEmi", "notes"] },
  ],
};

const loanTitles: Record<string, string> = {
  home: "Home Loan",
  personal: "Personal Loan",
  corporate: "Corporate Loan",
  lap: "Loan Against Property",
  business: "Business Loan",
  msme: "MSME Loan",
};

export default function LoanApplication() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState({
    fullName: "",
    mobile: "",
  });

  const [formData, setFormData] = useState<Record<string, string>>({
    amount: "",
    existingEmi: "",
    notes: "",
    companyName: "",
    salary: "",
    creditCardDue: "",
    propertyType: "",
    projectName: "",
    incomeType: "",
    propertyValue: "",
    propertyLocation: "",
    businessType: "",
    turnover: "",
    gst: "",
    requirementType: "",
    entityType: "",
    businessName: "",
    employmentType: "",
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const dataSteps = loanStepsConfig[type || ""] || loanStepsConfig.personal;
  const totalSteps = dataSteps.length + 1; // + Review
  const isReviewStep = step === totalSteps;
  const currentStepDef = !isReviewStep ? dataSteps[step - 1] : null;

  useEffect(() => {
    const fetchUser = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch(`https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`);
        const data = await res.json();

        if (data.status === "success") {
          setUserProfile({
            fullName: data.data.name,
            mobile: mobile,
          });

          if (!data.data.name || !data.data.city || !data.data.employment) {
            navigate("/profile");
          }
        } else {
          navigate("/profile");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const checkLoanEligibility = async (mobile: string, loanType: string | undefined) => {
    try {
      const res = await fetch(
        `https://api.fundsarthi.in/api/check-loan-eligibility?mobile=${encodeURIComponent(
          mobile
        )}&type=${encodeURIComponent(loanType || "")}`
      );
      return await res.json();
    } catch (error) {
      console.error("Eligibility check failed:", error);
      return {
        status: "error",
        message: "Unable to check your previous loan application.",
      };
    }
  };

  const validateCurrentStep = () => {
    if (!currentStepDef) return true;

    for (const key of currentStepDef.fields) {
      if (OPTIONAL_FIELDS.includes(key)) continue;

      if (key === "applicant") {
        if (!userProfile.fullName) {
          setStepError("Full Name is required.");
          return false;
        }
        continue;
      }

      if (!formData[key]) {
        setStepError(`${fieldMeta[key]?.label || key} is required.`);
        return false;
      }
    }

    setStepError("");
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStepError("");
      setStep((s) => s - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    const mobile = localStorage.getItem("userMobile");

    if (!mobile) {
      setStepError("Session expired. Please log in again.");
      navigate("/");
      return;
    }

    setSubmitting(true);
    setStepError("");

    try {
      const eligibility = await checkLoanEligibility(mobile, type);

      if (eligibility.status === "blocked" || eligibility.status === "error") {
        setStepError(eligibility.message);
        setSubmitting(false);
        return;
      }

      const res = await fetch("https://api.fundsarthi.in/api/apply-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          amount: formData.amount,
          existingEmi: formData.existingEmi,
          notes: formData.notes,
          cr_name: userProfile.fullName,
          cr_number: userProfile.mobile,
          type,
          formData,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        navigate(`/application-success/${data.application_id}`);
      } else {
        setStepError(data.message || "Application could not be submitted.");
      }
    } catch (err) {
      console.error(err);
      setStepError("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (key: string) => {
    if (key === "applicant") {
      return (
        <div key="applicant" className="bg-card rounded-2xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-4">Your Details</p>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
              <div className="relative">
                <Input
                  value={userProfile.fullName}
                  onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                  className="h-12 rounded-xl pr-10"
                />
                <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
              <div className="relative">
                <Input
                  value={userProfile.mobile}
                  disabled
                  className="h-12 rounded-xl pr-10 bg-muted/50 cursor-not-allowed"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const meta = fieldMeta[key];
    if (!meta) return null;

    if (meta.type === "select") {
      return (
        <div key={key}>
          <label className="text-sm text-muted-foreground mb-2 block">{meta.label}</label>
          <select
            value={formData[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            className="w-full h-12 rounded-xl border border-border bg-background px-3"
          >
            <option value="">Select {meta.label}</option>
            {meta.options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (meta.type === "textarea") {
      return (
        <div key={key}>
          <label className="text-sm text-muted-foreground mb-2 block">{meta.label}</label>
          <Textarea
            placeholder={meta.placeholder}
            value={formData[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            className="h-24 rounded-xl resize-none"
          />
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="text-sm text-muted-foreground mb-2 block">{meta.label}</label>
        <Input
          type="text"
          placeholder={meta.placeholder}
          value={formData[key]}
          onChange={(e) => {
            const value = meta.numeric ? e.target.value.replace(/\D/g, "") : e.target.value;
            setFormData({ ...formData, [key]: value });
          }}
          className="h-12 rounded-xl"
        />
      </div>
    );
  };

  const reviewRows = () => {
    const rows: { label: string; value: string }[] = [
      { label: "Full Name", value: userProfile.fullName },
      { label: "Mobile Number", value: userProfile.mobile },
    ];

    dataSteps.forEach((s) =>
      s.fields.forEach((key) => {
        if (key === "applicant") return;
        const meta = fieldMeta[key];
        if (!meta) return;
        const raw = formData[key];
        if (!raw && OPTIONAL_FIELDS.includes(key)) return;
        const display = meta.type === "select" ? meta.options.find((o: any) => o.value === raw)?.label : raw;
        rows.push({ label: meta.label, value: display || "-" });
      })
    );

    return rows;
  };

  if (loadingUser) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={handleBack} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">{loanTitles[type || ""] || "Loan"}</h1>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {isReviewStep ? "Review" : `Step ${step} of ${totalSteps}`}
          </span>
          <span className="text-sm text-primary">{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-4">
        {isReviewStep ? (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Review your details before submitting</p>
            <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
              {reviewRows().map((row) => (
                <div key={row.label} className="flex justify-between text-sm gap-4">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
              Fundsarthi is a DSA (loan referral) partner connecting you with our lending
              institution partners — we do not directly issue loans. Final approval, interest
              rate and terms are decided by the lending partner.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground mb-1">{currentStepDef?.title}</p>
            <div className="space-y-4">
              {currentStepDef?.fields.map((key) => renderField(key))}
            </div>
          </div>
        )}

        {stepError && (
          <p className="text-sm text-destructive mt-4">{stepError}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
            Back
          </Button>
        )}
        <GradientButton
          onClick={isReviewStep ? handleSubmit : handleNext}
          className="flex-1"
          disabled={submitting}
        >
          {isReviewStep ? (submitting ? "Submitting..." : "Submit Application") : "Continue"}
        </GradientButton>
      </div>
    </div>
  );
}
