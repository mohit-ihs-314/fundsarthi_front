import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Star,
  BadgeCheck,
  Languages,
  Award,
  Compass,
  Home,
  Sparkles,
  ShieldCheck,
  Sun,
  Building2,
  Route,
  CheckCircle2,
} from "lucide-react";
import { GradientButton } from "../../components/ui/gradient-button";

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expert, setExpert] = useState<any>(null);

  useEffect(() => {
    fetch(`https://api.fundsarthi.in/api/consultant/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setExpert(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const languages =
    typeof expert?.languages === "string"
      ? expert.languages
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : expert?.languages || [];

  const expertiseList = (() => {
    if (!expert?.expertise) return [];

    if (Array.isArray(expert.expertise)) {
      return expert.expertise;
    }

    try {
      const parsed = JSON.parse(expert.expertise);
      return Array.isArray(parsed) ? parsed : [expert.expertise];
    } catch {
      return String(expert.expertise)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  })();

  const serviceMap: any = {
    Residential: "Residential Vastu Consultation",
    Commercial: "Commercial Vastu Planning",
    Industrial: "Site Visit & Analysis",
    Other: "Vastu Correction Remedies",
  };

  const getServiceIcon = (service: string) => {
    const value = String(service).toLowerCase();

    if (value.includes("residential") || value.includes("home")) {
      return <Home className="h-5 w-5" />;
    }

    if (value.includes("commercial") || value.includes("office")) {
      return <Building2 className="h-5 w-5" />;
    }

    if (value.includes("site") || value.includes("plot")) {
      return <Compass className="h-5 w-5" />;
    }

    return <Sparkles className="h-5 w-5" />;
  };

  if (!expert) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
            <Compass className="h-7 w-7 animate-pulse" />
          </div>
          <p className="font-semibold text-[#4E210E]">
            Loading Vastu profile...
          </p>
        </div>
      </div>
    );
  }

  const isVerified =
    expert.status === "approved" ||
    expert.verified === true ||
    expert.verified === 1 ||
    expert.verified === "true";

  const rating = Number(expert.rating || 4.5);
  const reviews = Number(expert.reviews || 0);
  const fee = Number(expert.consultation_fee || 500);

  const mapsQuery =
    expert.latitude && expert.longitude
      ? `${expert.latitude},${expert.longitude}`
      : `${expert.address || ""}, ${expert.city || ""}`;

  return (
    <div className="h-full flex flex-col bg-[#FFF8F0]">
      {/* VASTU HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6E2100] via-[#A83F08] to-[#E0781B] text-white">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute -right-5 top-12 h-24 w-24 rounded-full border border-white/10" />

        <div className="relative flex items-center px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 backdrop-blur-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="ml-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-100">
              ॐ Vastu Shastra
            </p>
            <h1 className="text-lg font-bold">Expert Profile</h1>
          </div>

          <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Compass className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* HERO PROFILE */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#FFF1DD] to-[#FFF8F0] px-5 pb-6 pt-5">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border border-[#E9B989]/40" />
          <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full border border-[#E9B989]/30" />

          <div className="relative flex gap-4">
            <div className="relative shrink-0">
              <div className="rounded-[24px] border-2 border-[#E7A96D] bg-white p-1 shadow-[0_8px_25px_rgba(122,38,0,0.12)]">
                <img
                  src={
                    expert.photo ||
                    expert.image ||
                    "https://via.placeholder.com/400"
                  }
                  alt={expert.full_name || "Vastu Expert"}
                  className="h-24 w-24 rounded-[19px] object-cover"
                />
              </div>

              {isVerified && (
                <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#C65312] shadow-lg">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#C65312] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                  ॐ Vastu Expert
                </span>

                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF6E9] px-2 py-1 text-[9px] font-bold text-[#397238]">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-[22px] font-extrabold leading-tight text-[#4E210E]">
                {expert.full_name}
              </h2>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8C6A58]">
                {expertiseList.length > 0
                  ? expertiseList.join(" • ")
                  : "Vastu Consultant"}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#E5A51C] text-[#E5A51C]" />
                  <span className="text-sm font-bold text-[#4E210E]">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-[#8C6A58]">
                    ({reviews})
                  </span>
                </div>

                <div className="h-4 w-px bg-[#DDBD9F]" />

                <div className="flex items-center gap-1 text-xs text-[#7D5E4B]">
                  <Award className="h-4 w-4 text-[#B94A0B]" />
                  {expert.experience || 0} years
                </div>
              </div>
            </div>
          </div>

          {/* CONSULTATION FEE */}
          <div className="relative mt-5 flex items-center justify-between rounded-2xl border border-[#E9B989] bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#A47A61]">
                Consultation Fee
              </p>
              <p className="mt-0.5 text-xl font-extrabold text-[#B94A0B]">
                ₹{fee.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* VASTU COMPASS */}
        <div className="px-5 pt-4">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#7A2600] via-[#B94A0B] to-[#E67E22] p-5 text-white shadow-[0_10px_30px_rgba(122,38,0,0.16)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />

            <div className="relative flex items-center gap-5">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm">
                <div className="absolute inset-3 rounded-full border border-white/25" />
                <div className="absolute inset-6 rounded-full border border-dashed border-white/25" />

                <span className="absolute top-1 text-[9px] font-bold">N</span>
                <span className="absolute bottom-1 text-[9px] font-bold">S</span>
                <span className="absolute left-2 text-[9px] font-bold">W</span>
                <span className="absolute right-2 text-[9px] font-bold">E</span>

                <div className="absolute h-16 w-px rotate-45 bg-white/80" />
                <div className="absolute h-16 w-px -rotate-45 bg-white/50" />

                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1DD] text-[#A63F08] shadow-lg">
                  <Compass className="h-7 w-7" />
                </div>

                <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#FFD166]" />
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-serif text-2xl">ॐ</span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-100">
                    Vastu Guidance
                  </p>
                </div>
                <h3 className="text-lg font-bold">
                  Direction • Balance • Harmony
                </h3>
                <p className="mt-1 text-[11px] leading-4 text-orange-50/85">
                  Get personalised guidance for your home, office, plot or
                  commercial space.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SPACE TYPES */}
        <div className="px-5 pt-5">
          <div className="mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B94A0B]">
              Areas of Expertise
            </p>
            <h3 className="mt-1 text-xl font-bold text-[#4E210E]">
              What can this expert help with?
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <Home className="h-5 w-5" />,
                title: "Home Vastu",
                text: "Rooms, entrances & layouts",
              },
              {
                icon: <Building2 className="h-5 w-5" />,
                title: "Commercial",
                text: "Offices & business spaces",
              },
              {
                icon: <Compass className="h-5 w-5" />,
                title: "Directions",
                text: "Plot & property orientation",
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Corrections",
                text: "Remedies & energy balance",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#EBC7A8] bg-white p-4 shadow-[0_4px_14px_rgba(122,38,0,0.05)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
                  {item.icon}
                </div>
                <p className="text-sm font-bold text-[#4E210E]">
                  {item.title}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#8C6A58]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* LOCATION */}
        <div className="mt-5 border-y border-[#F0D7BE] bg-white px-5 py-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#A47A61]">
                Service Location
              </p>
              <h3 className="font-bold text-[#4E210E]">
                {expert.city || "Location"}
              </h3>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#EBC7A8] bg-[#FFF8F0]">
            <iframe
              title={`${expert.full_name} location`}
              src={
                expert.latitude && expert.longitude
                  ? `https://www.google.com/maps?q=${expert.latitude},${expert.longitude}&z=15&output=embed`
                  : `https://www.google.com/maps?q=${encodeURIComponent(
                      `${expert.address || ""}, ${expert.city || ""}`,
                    )}&output=embed`
              }
              className="h-[220px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <a
            href={
              expert.latitude && expert.longitude
                ? `https://www.google.com/maps/search/?api=1&query=${expert.latitude},${expert.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${expert.address || ""}, ${expert.city || ""}`,
                  )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#B94A0B]"
          >
            <Route className="h-4 w-4" />
            Open exact location in Google Maps
          </a>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFF5E9] p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C65312]" />
            <div>
              <p className="text-xs font-semibold text-[#4E210E]">
                {expert.city || "Location"}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#8C6A58]">
                {expert.address ||
                  expert.location ||
                  "Address not available"}
              </p>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="px-5 py-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#A47A61]">
                Know Your Expert
              </p>
              <h3 className="font-bold text-[#4E210E]">About</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EBC7A8] bg-white p-4">
            <p className="text-sm leading-6 text-[#705648]">
              {expert.bio || "No description available"}
            </p>
          </div>
        </div>

        {/* SERVICES */}
        <div className="border-t border-[#F0D7BE] bg-[#FFF4E8] px-5 py-5">
          <div className="mb-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B94A0B]">
              Consultation Areas
            </p>
            <h3 className="mt-1 text-xl font-bold text-[#4E210E]">
              Services Offered
            </h3>
          </div>

          <div className="space-y-3">
            {expertiseList.length > 0 ? (
              expertiseList.map((service: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-[#EBC7A8] bg-white p-3 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
                    {getServiceIcon(service)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#4E210E]">
                      {serviceMap[service] || service}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#8C6A58]">
                      Personalised Vastu guidance
                    </p>
                  </div>

                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C65312]" />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[#EBC7A8] bg-white p-4 text-sm text-[#8C6A58]">
                Vastu consultation and guidance
              </div>
            )}
          </div>
        </div>

        {/* LANGUAGES */}
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-[#EBC7A8] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#A47A61]">
                  Communication
                </p>
                <p className="mt-1 text-sm font-semibold text-[#4E210E]">
                  {languages.length > 0
                    ? languages.join(", ")
                    : "Languages not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="border-t border-[#EBC7A8] bg-[#FFFDF9] px-5 pt-3 shadow-[0_-8px_25px_rgba(122,38,0,0.08)]">
        <div
          className="pb-3"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <GradientButton
            onClick={() =>
              navigate(`/vastu/book-consultation/${expert.id}`, {
                state: { expert },
              })
            }
            className="w-full !bg-[#B94A0B] !shadow-[0_8px_20px_rgba(185,74,11,0.25)]"
          >
            Get Expert Consultation
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
