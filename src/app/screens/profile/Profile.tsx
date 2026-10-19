import { useNavigate } from "react-router";
import { BottomNav } from "../../components/BottomNav";
import WhatsAppSupport from "../../components/WhatsAppSupport";
import {
  ChevronRight,
  FileText,
  Calendar,
  LogOut,
  Bell,
  Briefcase,
  AlertCircle,
  Heart,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GradientButton } from "../../components/ui/gradient-button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { initNotifications } from "../../services/notification";
import { NCR_CITIES } from "../../utils/constants";

export default function Profile() {
  const navigate = useNavigate();

  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    city: "",
    employment: "",
    income: "",
  });

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    city: "",
    employment: "",
  });

  const [isApprovedConsultant, setIsApprovedConsultant] = useState(false);
  const [consultantStatus, setConsultantStatus] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Logout confirmation popup state
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    const checkConsultant = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/check-consultant-status?mobile=${mobile}`
        );

        const data = await res.json();

        if (data.status === "success") {
          setIsApprovedConsultant(data.approved);
          setConsultantStatus(data.consultant_status || "not_applied");

          // ONLY IF APPROVED → STORE ID
          if (data.approved) {
            try {
              const res2 = await fetch(
                `https://api.fundsarthi.in/api/get-consultant-id?mobile=${mobile}`
              );

              const data2 = await res2.json();

              if (data2.status === "success") {
                localStorage.setItem(
                  "consultantId",
                  data2.consultant_id
                );

                console.log(
                  "Consultant ID stored:",
                  data2.consultant_id
                );
              }
            } catch (err) {
              console.error("ID fetch error:", err);
            }
          } else {
            // NOT CONSULTANT → REMOVE ID
            localStorage.removeItem("consultantId");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkConsultant();
  }, []);

  // Actually perform logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("consultantId");

    // Force reload so router re-checks auth
    window.location.href = "/";
  };

  // Open confirmation popup
  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  // Close confirmation popup
  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  // Listen for storage changes to refresh profile
  useEffect(() => {
    const fetchProfile = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`
        );

        const data = await res.json();

        if (data.status === "success") {
          const profile = data.data;

          localStorage.setItem("userName", profile.name);

          if (profile.name) {
            setIsProfileComplete(true);

            setProfileData({
              name: profile.name,
              phone: mobile,
              city: profile.city,
              employment: profile.employment,
            });

            setFormData({
              fullName: profile.name || "",
              city: (profile.city || "").toLowerCase(),
              employment: profile.employment || "",
              income: profile.income || "",
            });
          } else {
            setIsProfileComplete(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [refreshKey]);

  const handleCompleteProfile = async () => {
    const mobile = localStorage.getItem("userMobile");

    if (!mobile) {
      alert("Session expired");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(
        "https://api.fundsarthi.in/api/update-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            ...formData,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        // Save FCM now
        await initNotifications();

        alert("Profile updated");

        localStorage.setItem(
          "userProfile",
          JSON.stringify(formData)
        );

        setRefreshKey((prev) => prev + 1);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const menuItems = [
    {
      icon: Calendar,
      label: "Activities",
      path: "/activities",
      show: true,
    },
    {
      icon: FileText,
      label: "My Applications",
      path: "/my-applications",
      show: true,
    },
    {
      icon: Heart,
      label: "Wishlist",
      path: "/wishlist",
      show: true,
    },
    {
      icon: Calendar,
      label: "My Consultations",
      path: "/my-consultations",
      show: true,
    },
    {
      icon: Briefcase,
      label: "Manage Vastu Bookings",
      path: "/my-bookings",
      show: isApprovedConsultant,
    },
    {
      icon: Calendar,
      label: "Manage Slots",
      path: "/manage-slots",
      show: isApprovedConsultant,
    },
    {
      icon: FileText,
      label: "Terms of Use",
      path: "/terms",
      show: true,
    },
    {
      icon: Bell,
      label: "Contact & Help",
      path: "/contact-help",
      show: true,
    },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* PROFILE PAGE */}
      {/* ========================================================= */}

      {!isProfileComplete ? (
        /* ======================================================= */
        /* STATE 1: INCOMPLETE PROFILE */
        /* ======================================================= */
        <div className="h-full flex flex-col bg-background">
          {/* Header */}
          <div className="px-6 py-6 bg-gradient-to-br from-primary to-primary/80 text-white">
            <h1 className="text-2xl">My Profile</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-20 px-6 py-6">
            {/* Warning Message */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />

              <div>
                <p className="text-sm mb-1">
                  Complete your profile to unlock loan applications
                  and personalized offers.
                </p>
              </div>
            </div>

            {/* Profile Completion Form */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-5">
                Complete Your Profile
              </h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Full Name
                  </label>

                  <Input
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    City
                  </label>

                  <Select
                    value={formData.city}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        city: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>

                    <SelectContent>
                      {NCR_CITIES.map((city) => (
                        <SelectItem
                          key={city}
                          value={city.toLowerCase()}
                        >
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Type */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Employment Type
                  </label>

                  <Select
                    value={formData.employment}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        employment: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Salaried">
                        Salaried
                      </SelectItem>

                      <SelectItem value="Self Employed">
                        Self Employed
                      </SelectItem>

                      <SelectItem value="Business">
                        Business
                      </SelectItem>

                      <SelectItem value="Others">
                        Others
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monthly Income */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Monthly Income
                  </label>

                  <Input
                    type="text"
                    placeholder="Enter monthly income"
                    value={formData.income}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setFormData({
                        ...formData,
                        income: value,
                      });
                    }}
                    className="h-12 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <GradientButton
                onClick={handleCompleteProfile}
                className="w-full mt-6 h-12 rounded-xl text-base font-medium shadow-md active:scale-95 transition-all"
                disabled={
                  !formData.fullName ||
                  !formData.city ||
                  !formData.employment ||
                  !formData.income
                }
              >
                Continue
              </GradientButton>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow flex items-center gap-4 mt-6 text-destructive"
            >
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>

              <span>Logout</span>
            </button>
          </div>

          <BottomNav />
          <WhatsAppSupport />
        </div>
      ) : (
        /* ======================================================= */
        /* STATE 2: COMPLETED PROFILE */
        /* ======================================================= */
        <div className="h-full flex flex-col bg-background">
          {/* Header */}
          <div className="px-6 py-6 bg-gradient-to-br from-primary to-primary/80 text-white">
            <h1 className="text-2xl mb-6">My Profile</h1>

            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-lg font-semibold">
                  {profileData.name?.charAt(0)}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-xl mb-1">
                    {profileData.name}
                  </h2>

                  <p className="text-sm opacity-90">
                    {profileData.phone}
                  </p>

                  {/* Edit Profile */}
                  <button
                    type="button"
                    onClick={() => setIsProfileComplete(false)}
                    className="text-xs underline mt-1 opacity-80 hover:opacity-100"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="opacity-75 mb-1">City</p>
                    <p className="text-xs">{profileData.city}</p>
                  </div>

                  <div>
                    <p className="opacity-75 mb-1">Employment</p>
                    <p className="text-xs">
                      {profileData.employment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-20 px-6 py-6">
            {/* Consultant Status */}
            {consultantStatus &&
              consultantStatus !== "not_applied" && (
                <div
                  className={`rounded-2xl p-4 mb-4 text-sm font-medium ${
                    consultantStatus === "approved"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : consultantStatus === "rejected"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  {consultantStatus === "approved" &&
                    "✅ Vastu Consultant — Approved"}

                  {consultantStatus === "pending" &&
                    "⏳ Vastu Consultant application under review"}

                  {consultantStatus === "rejected" &&
                    "❌ Vastu Consultant application was not approved"}
                </div>
              )}

            {/* Menu Items */}
            <div className="space-y-3">
              {menuItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>

                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-1 bg-primary text-white rounded-full text-xs">
                            {item.badge}
                          </span>
                        )}

                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow flex items-center gap-4 mt-6 text-destructive"
            >
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>

              <span>Logout</span>
            </button>
          </div>

          <BottomNav />
        </div>
      )}

      {/* ========================================================= */}
      {/* LOGOUT CONFIRMATION POPUP */}
      {/* ========================================================= */}

      {showLogoutConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5"
          onClick={handleCancelLogout}
        >
          <div
            className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Confirm Logout
              </h2>

              <button
                type="button"
                onClick={handleCancelLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            <p className="text-muted-foreground text-sm leading-6 mb-6">
              Are you sure you want to logout?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}