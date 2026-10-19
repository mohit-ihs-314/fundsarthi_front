import { Home, TrendingUp, Building2, Compass, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: TrendingUp, label: "Loans", path: "/loans" },
    { icon: Building2, label: "Property", path: "/property" },
    { icon: Compass, label: "Vastu", path: "/vastu" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        bottom: "max(env(safe-area-inset-bottom), 14px)",
      }}
    >
      {/* Floating Container */}
      <div className="pointer-events-auto w-[92%] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-4 py-2 flex justify-between items-center">

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 py-1"
            >
              {/* Active Bubble */}
              <div
                className={`absolute -top-1 w-12 h-8 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-accent to-primary text-white hover:shadow-lg"
                    : "scale-0"
                }`}
              />

              {/* Icon */}
              <Icon
                className={`w-5 h-5 z-10 transition-all ${
                  isActive ? "text-white" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={`text-[10px] mt-1 z-10 transition-all ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}