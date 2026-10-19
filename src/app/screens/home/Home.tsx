import { useNavigate } from "react-router";
import { BottomNav } from "../../components/BottomNav";
import { getInitials, getGreeting } from "../../utils/helpers";
import WhatsAppSupport from "../../components/WhatsAppSupport";

import {
  Bell,
  MapPin,
  TrendingUp,
  Building2,
  Compass,
  Users,
  Calculator,
  FileText,
  CreditCard,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { CompleteProfileModal } from "../../components/CompleteProfileModal";

type UserProfile = {
  name?: string;
  city?: string;
  employment?: string;
  monthly_income?: number | string;
  monthlyIncome?: number | string;
  income?: number | string;
};

type LoanStep = {
  done?: boolean;
};

export default function Home() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [loanprogress, setloanProgress] = useState(0);
  const [loanSteps, setLoanSteps] = useState<LoanStep[]>([]);
  const [hasLoan, setHasLoan] = useState(false);

  const [user, setUser] = useState<UserProfile | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [liveLocation, setLiveLocation] = useState("Select Location");

  const [bannerIndex, setBannerIndex] = useState(0);

  // --------------------------------------------------
  // FETCH LOAN STATUS
  // --------------------------------------------------

  useEffect(() => {
    const fetchLoanStatus = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/loan-status?mobile=${encodeURIComponent(
            mobile
          )}`
        );

        const data = await res.json();

        if (data.status === "success") {
          const steps = Array.isArray(data.data) ? data.data : [];

          setHasLoan(Boolean(data.hasLoan));
          setLoanSteps(steps);

          const doneSteps = steps.filter(
            (step: LoanStep) => step.done
          ).length;

          setloanProgress(
            steps.length > 0 ? (doneSteps / steps.length) * 100 : 0
          );
        }
      } catch (err) {
        console.error("Loan status error:", err);
      }
    };

    fetchLoanStatus();
  }, []);

  // --------------------------------------------------
  // FETCH USER PROFILE
  // --------------------------------------------------

  useEffect(() => {
    const fetchUser = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/user-profile?mobile=${encodeURIComponent(
            mobile
          )}`
        );

        const data = await res.json();

        if (data.status === "success") {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // --------------------------------------------------
  // LOAN ELIGIBILITY
  // --------------------------------------------------

  const monthlyIncome = Number(
    user?.monthly_income ||
      user?.monthlyIncome ||
      user?.income ||
      0
  );

  const eligibleLoanAmount = monthlyIncome * 100;

  const formatLoanAmount = (amount: number) => {
    if (!amount || amount <= 0) {
      return "₹0";
    }

    if (amount >= 10000000) {
      const crores = amount / 10000000;

      return `₹${
        crores % 1 === 0 ? crores : crores.toFixed(2)
      } Cr`;
    }

    if (amount >= 100000) {
      const lakhs = amount / 100000;

      return `₹${
        lakhs % 1 === 0 ? lakhs : lakhs.toFixed(2)
      } Lakh`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // --------------------------------------------------
  // USER DETAILS
  // --------------------------------------------------

  const userName = user?.name || "User";
  const greeting = getGreeting();
  const initials = getInitials(userName);

  // --------------------------------------------------
  // LOCATION
  // --------------------------------------------------

  useEffect(() => {
    const updateLocation = () => {
      const city = localStorage.getItem("userCity");
      const locality = localStorage.getItem("userLocality");

      if (locality && city) {
        setLiveLocation(`${locality}, ${city}`);
      } else if (city) {
        setLiveLocation(city);
      } else if (user?.city) {
        setLiveLocation(user.city);
      } else {
        setLiveLocation("Select Location");
      }
    };

    updateLocation();

    window.addEventListener("locationUpdated", updateLocation);

    return () => {
      window.removeEventListener(
        "locationUpdated",
        updateLocation
      );
    };
  }, [user]);

  // --------------------------------------------------
  // NAVIGATION / PROFILE CHECK
  // --------------------------------------------------

  const checkProfileAndNavigate = (path: string) => {
    const isLoanPage =
      path.includes("/loan") || path === "/loans";

    if (
      isLoanPage &&
      (!user?.name ||
        !user?.city ||
        !user?.employment)
    ) {
      setShowProfileModal(true);
    } else {
      navigate(path);
    }
  };

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    navigate("/profile");
  };

  // --------------------------------------------------
  // BANNERS
  // --------------------------------------------------

  const banners = [
    {
      title: "Get Home Loan up to ₹50L",
      subtitle: "Low interest rates available",
      path: "/loans",
      cta: "Apply Now",
    },
    {
      title: "Find Your Dream Property",
      subtitle: "Verified listings in your area",
      path: "/property",
      cta: "View Properties",
    },
    {
      title: "Check Loan Eligibility",
      subtitle: "Know your eligibility instantly",
      path: "/calculator/eligibility",
      cta: "Check Eligibility",
    },
  ];

  const nextBanner = () => {
    setBannerIndex(
      (prev) => (prev + 1) % banners.length
    );
  };

  const previousBanner = () => {
    setBannerIndex(
      (prev) =>
        (prev - 1 + banners.length) %
        banners.length
    );
  };

  // --------------------------------------------------
  // BANNER TOUCH / SWIPE
  // --------------------------------------------------

  const bannerTouchStartX =
    useRef<number | null>(null);

  const bannerTouchStartY =
    useRef<number | null>(null);

  const bannerTouchMoved =
    useRef(false);

  const bannerPausedRef =
    useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!bannerPausedRef.current) {
        nextBanner();
      }
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const handleBannerTouchStart = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    const touch = e.touches[0];

    bannerTouchStartX.current = touch.clientX;
    bannerTouchStartY.current = touch.clientY;

    bannerTouchMoved.current = false;
    bannerPausedRef.current = true;
  };

  const handleBannerTouchMove = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      bannerTouchStartX.current === null ||
      bannerTouchStartY.current === null
    ) {
      return;
    }

    const touch = e.touches[0];

    const dx =
      touch.clientX -
      bannerTouchStartX.current;

    const dy =
      touch.clientY -
      bannerTouchStartY.current;

    if (
      Math.abs(dx) > 8 ||
      Math.abs(dy) > 8
    ) {
      bannerTouchMoved.current = true;
    }
  };

  const handleBannerTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    const startX = bannerTouchStartX.current;

    if (startX !== null) {
      const touch = e.changedTouches[0];

      const difference =
        startX - touch.clientX;

      if (Math.abs(difference) > 50) {
        if (difference > 0) {
          nextBanner();
        } else {
          previousBanner();
        }
      }
    }

    bannerTouchStartX.current = null;
    bannerTouchStartY.current = null;

    window.setTimeout(() => {
      bannerPausedRef.current = false;
      bannerTouchMoved.current = false;
    }, 700);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden overscroll-none">
      {/* ==================================================
          OVERLAY
      ================================================== */}

      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[82%] max-w-[320px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}

        <div className="bg-[var(--primary)] text-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {userName}
              </h2>

              <p className="text-sm text-white/80 truncate">
                {liveLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Body */}

        <div className="flex flex-col h-[calc(100%-100px)]">
          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            {/* Profile */}

            <button
              onClick={() => {
                navigate("/profile");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  My Profile
                </p>

                <p className="text-xs text-muted-foreground">
                  Manage your account
                </p>
              </div>
            </button>

            {/* Manage Listings */}

            <button
              onClick={() => {
                navigate("/my-properties");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  Manage Listings
                </p>

                <p className="text-xs text-muted-foreground">
                  Your posted properties
                </p>
              </div>
            </button>

            {/* Loan Status */}

            <button
              onClick={() => {
                navigate("/my-applications");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  Loan Status
                </p>

                <p className="text-xs text-muted-foreground">
                  Track your applications
                </p>
              </div>
            </button>

            {/* Consultations */}

            <button
              onClick={() => {
                navigate("/my-consultations");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  My Consultations
                </p>

                <p className="text-xs text-muted-foreground">
                  Your scheduled consultations
                </p>
              </div>
            </button>

            {/* Logout */}

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  Logout
                </p>

                <p className="text-xs text-red-400">
                  Securely sign out
                </p>
              </div>
            </button>
          </div>

          {/* Profile Progress */}

          <div className="p-4 border-t border-border space-y-3">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Complete Profile
                </p>

                <p className="text-xs text-[var(--primary)] font-semibold">
                  80%
                </p>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[80%] bg-[var(--primary)] rounded-full" />
              </div>

              <button
                onClick={() => {
                  navigate("/profile");
                  setSidebarOpen(false);
                }}
                className="mt-3 text-xs font-medium text-[var(--primary)]"
              >
                Update Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between gap-3">
          {/* User */}

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md active:scale-90 transition-all duration-150"
            >
              <span className="text-white font-semibold text-base sm:text-lg">
                {initials}
              </span>
            </button>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {greeting}
              </p>

              <h2 className="text-base font-medium truncate">
                {userName}
              </h2>

              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />

                <span className="truncate">
                  {liveLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Notification */}

          <button className="shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main
        className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden pb-24 overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehaviorY: "contain",
        }}
      >
        {/* ==================================================
            HOME BANNER
        ================================================== */}

        <section className="px-4 pt-4 pb-4">
          <div className="relative w-full">
            {/* Banner viewport */}

            <div
              className="relative w-full h-[185px] sm:h-[196px] overflow-hidden rounded-[24px] sm:rounded-[26px]"
              onTouchStart={handleBannerTouchStart}
              onTouchMove={handleBannerTouchMove}
              onTouchEnd={handleBannerTouchEnd}
              style={{
                touchAction: "pan-y",
              }}
            >
              {/* Slider Track */}

              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{
                  transform: `translate3d(-${
                    bannerIndex *
                    (100 / banners.length)
                  }%, 0, 0)`,

                  width: `${banners.length * 100}%`,
                }}
              >
                {banners.map((banner, i) => (
                  <div
                    key={i}
                    className="relative h-full shrink-0"
                    style={{
                      width: `${100 / banners.length}%`,
                    }}
                  >
                    {/* Individual Banner */}

                    <div
                      onClick={() => {
                        if (!bannerTouchMoved.current) {
                          navigate(banner.path);
                        }
                      }}
                      className="relative w-full h-full overflow-hidden rounded-[24px] sm:rounded-[26px] px-5 py-4 sm:px-5 sm:py-5 bg-[var(--primary)] text-white shadow-xl cursor-pointer"
                    >
                      {/* Decorative glow */}

                      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                      {/* ==================================================
                          BANNER CONTENT

                          IMPORTANT:
                          Absolute positioning keeps content stable
                          across Samsung / OnePlus / Vivo / Redmi etc.
                      ================================================== */}

                      <div className="absolute inset-0 flex items-start">
                        <div className="relative z-10 w-full min-w-0 px-5 pt-4 sm:pt-5">
                          {/* Badge */}

                          <div className="inline-flex max-w-[calc(100%-70px)] items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-medium mb-2.5 border border-white/10 whitespace-nowrap overflow-hidden text-ellipsis">
                            <span>✨</span>

                            <span>
                              Trusted by 10,000+ users
                            </span>
                          </div>

                          {/* Title */}

                          <h2 className="text-[19px] sm:text-[20px] leading-[1.12] font-bold max-w-[285px] mb-1.5 break-words">
                            {banner.title}
                          </h2>

                          {/* Subtitle */}

                          <p className="text-[12px] sm:text-[13px] text-white/80 max-w-[260px] leading-[1.3] mb-2.5">
                            {banner.subtitle}
                          </p>

                          {/* CTA */}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(banner.path);
                            }}
                            className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-white text-[var(--primary)] text-[12px] sm:text-[13px] font-semibold shadow-md active:scale-95 transition-all whitespace-nowrap"
                          >
                            {banner.cta}
                          </button>
                        </div>
                      </div>

                      {/* Decorative Icon */}

                      <div className="absolute right-4 bottom-3 opacity-10 pointer-events-none">
                        {i === 0 && (
                          <TrendingUp className="w-20 h-20" />
                        )}

                        {i === 1 && (
                          <Building2 className="w-20 h-20" />
                        )}

                        {i === 2 && (
                          <Calculator className="w-20 h-20" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ==================================================
                DOTS
            ================================================== */}

            <div className="flex justify-center gap-2 mt-3 h-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to banner ${
                    i + 1
                  }`}
                  onClick={() =>
                    setBannerIndex(i)
                  }
                  className={`rounded-full transition-all duration-300 ${
                    i === bannerIndex
                      ? "w-6 h-2 bg-[var(--primary)]"
                      : "w-2 h-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            LOAN ELIGIBILITY
        ================================================== */}

        <section className="px-6 mb-4">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <p className="text-sm font-medium">
              💡 You may be eligible for a home loan of{" "}
              {formatLoanAmount(
                eligibleLoanAmount
              )}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Based on your monthly income of{" "}
              {monthlyIncome > 0
                ? `₹${monthlyIncome.toLocaleString(
                    "en-IN"
                  )}`
                : "your profile & income"}
            </p>
          </div>
        </section>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="px-6 mb-6">
          <h3 className="mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Apply Loan */}

            <button
              onClick={() =>
                checkProfileAndNavigate(
                  "/loans"
                )
              }
              className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>

              <p className="text-sm">
                Apply For Loan
              </p>
            </button>

            {/* Properties */}

            <button
              onClick={() =>
                checkProfileAndNavigate(
                  "/property"
                )
              }
              className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-primary" />
              </div>

              <p className="text-sm">
                Explore Properties
              </p>
            </button>

            {/* Vastu */}

            <button
              onClick={() =>
                checkProfileAndNavigate(
                  "/vastu"
                )
              }
              className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Compass className="w-6 h-6 text-primary" />
              </div>

              <p className="text-sm">
                Connect with Vastu Expert
              </p>
            </button>

            {/* Partner */}

            <button
              onClick={() =>
                checkProfileAndNavigate(
                  "/become-partner"
                )
              }
              className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>

              <p className="text-sm">
                Become a Partner
              </p>
            </button>
          </div>
        </section>

        {/* ==================================================
            FINANCIAL CALCULATORS
        ================================================== */}

        <section className="px-6 mb-6">
          <h3 className="mb-4">
            Financial Calculators
          </h3>

          <div className="space-y-3">
            {/* EMI */}

            <button
              onClick={() =>
                navigate("/calculator/emi")
              }
              className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm">
                  EMI Calculator
                </p>

                <p className="text-xs text-muted-foreground">
                  Calculate monthly payments
                </p>
              </div>
            </button>

            {/* Eligibility */}

            <button
              onClick={() =>
                navigate(
                  "/calculator/eligibility"
                )
              }
              className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm">
                  Eligibility Calculator
                </p>

                <p className="text-xs text-muted-foreground">
                  Check loan eligibility
                </p>
              </div>
            </button>

            {/* Credit Score */}

            <button
              onClick={() =>
                navigate(
                  "/calculator/credit-score"
                )
              }
              className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm">
                  Credit Score Estimator
                </p>

                <p className="text-xs text-muted-foreground">
                  Estimate your credit score
                </p>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <div className="shrink-0">
        <BottomNav />
      </div>

      {/* ==================================================
          WHATSAPP
      ================================================== */}

      <WhatsAppSupport />

      {/* ==================================================
          COMPLETE PROFILE MODAL
      ================================================== */}

      <CompleteProfileModal
        isOpen={showProfileModal}
        onClose={() =>
          setShowProfileModal(false)
        }
        onCompleteProfile={
          handleCompleteProfile
        }
      />
    </div>
  );
}