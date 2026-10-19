import { useNavigate } from "react-router";
import { BottomNav } from "../../components/BottomNav";
import {
  Briefcase,
  Home,
  Building2,
  TrendingUp,
  Building,
  Factory,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CompleteProfileModal } from "../../components/CompleteProfileModal";

export default function LoanCategories() {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) {
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`,
        );

        const data = await res.json();

        if (data.status === "success") {
          setUser(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    navigate("/profile");
  };

  const handleLoanClick = (loanId) => {
    if (loadingUser) return;

    if (!user?.name || !user?.city || !user?.employment) {
      setShowProfileModal(true);
    } else {
      navigate(`/loan-application/${loanId}`);
    }
  };

  const loanTypes = [
    {
      id: "home",
      icon: Home,
      title: "Home Loan",
      description: "Starting at just 7.10% p.a.",
      color: "bg-blue-500",
    },
    {
      id: "personal",
      icon: Briefcase,
      title: "Personal Loan",
      description: "Starting at just 9.99% p.a.",
      color: "bg-green-500",
    },
    {
      id: "corporate",
      icon: Building,
      title: "Corporate Loan",
      description: "Fuel your business growth",
      color: "bg-purple-500",
    },
    {
      id: "lap",
      icon: Building2,
      title: "Loan Against Property",
      description: "Funding upto 90% of property rate",
      color: "bg-orange-500",
    },
    {
      id: "business",
      icon: TrendingUp,
      title: "Business Loan",
      description: "Get unsecured upto 5 Cr",
      color: "bg-red-500",
    },
    {
      id: "msme",
      icon: Factory,
      title: "MSME Loan",
      description: "Best offers from top banks",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <h1>Loan Categories</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 px-5 py-5">

        <p className="text-muted-foreground mb-4">
          Choose the loan type that suits your needs
        </p>

        <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 mb-6">
          Fundsarthi is a DSA (loan referral) partner connecting you with our
          lending institution partners — we do not directly issue loans.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {loanTypes.map((loan) => {
            const Icon = loan.icon;

            return (
              <button
                key={loan.id}
                onClick={() => handleLoanClick(loan.id)}
                className="
                  bg-white
                  rounded-3xl
                  p-4
                  border
                  border-gray-100
                  shadow-sm
                  hover:shadow-lg
                  active:scale-[0.98]
                  transition-all
                  flex
                  flex-col
                  items-start
                  text-left
                  min-h-[170px]
                "
              >
                {/* Icon */}
                <div
                  className={`
                    w-14 h-14
                    ${loan.color}
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    shadow-md
                    mb-4
                  `}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-[15px] leading-snug font-semibold mb-2">
                  {loan.title}
                </h3>

                {/* Description */}
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {loan.description}
                </p>

                {/* Small CTA */}
                <div className="mt-auto pt-4">
                  <span className="text-xs font-medium text-primary">
                    Apply Now →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onCompleteProfile={handleCompleteProfile}
      />
    </div>
  );
}