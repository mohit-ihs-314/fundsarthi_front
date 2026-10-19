import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../../components/BottomNav";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  BadgeCheck,
  Languages,
  Briefcase,
  X,
  Compass,
  Home,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function VastuHome() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedFee, setSelectedFee] = useState("All");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [sortBy, setSortBy] = useState("Recommended");
  const [selectedAvailability, setSelectedAvailability] = useState("Any");
  const [activeFilter, setActiveFilter] = useState("Availability");

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location permission/error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  useEffect(() => {
    fetch("https://api.fundsarthi.in/api/consultants")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setExperts(Array.isArray(data.data) ? data.data : []);
        } else {
          setExperts([]);
        }
      })
      .catch((err) => {
        console.error("Consultants API Error:", err);
        setExperts([]);
      })
      .finally(() => setIsLoadingExperts(false));
  }, []);

  const getExperienceYears = (experience: any) => {
    const match = String(experience || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const getCleanLanguages = (languages: any) => {
    if (!languages) return [];

    if (Array.isArray(languages)) {
      return languages
        .join(" ")
        .replace(/[.,]/g, " ")
        .split(/\s+/)
        .map((lang) => lang.trim())
        .filter(Boolean);
    }

    return String(languages)
      .replace(/[.,]/g, " ")
      .split(/\s+/)
      .map((lang) => lang.trim())
      .filter(Boolean);
  };

  const getFee = (expert: any) => {
    const rawFee =
      expert.consultation_fee ??
      expert.consultationFee ??
      expert.fee ??
      0;

    const fee = Number(String(rawFee).replace(/[^\d.]/g, ""));
    return Number.isFinite(fee) ? fee : 0;
  };

  const getRating = (expert: any) => Number(expert.rating ?? 0) || 0;

  const getReviews = (expert: any) =>
    Number(
      expert.reviews ??
        expert.review_count ??
        expert.reviewCount ??
        0,
    ) || 0;

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistance = (expert: any) => {
    const backendDistance = Number(
      expert.distance ?? expert.distance_km ?? expert.distanceKm,
    );

    if (Number.isFinite(backendDistance)) return backendDistance;
    if (!userLocation) return Infinity;

    const expertLat = Number(
      expert.latitude ??
        expert.lat ??
        expert.location_latitude ??
        expert.locationLatitude,
    );

    const expertLng = Number(
      expert.longitude ??
        expert.lng ??
        expert.location_longitude ??
        expert.locationLongitude,
    );

    if (!Number.isFinite(expertLat) || !Number.isFinite(expertLng)) {
      return Infinity;
    }

    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      expertLat,
      expertLng,
    );
  };

  const getAvailabilityText = (expert: any) =>
    [
      expert.availability,
      expert.availability_status,
      expert.availabilityStatus,
      expert.available,
      expert.available_today,
      expert.available_tomorrow,
      expert.available_in_4_hours,
      expert.availableIn4Hours,
      expert.availableToday,
      expert.availableTomorrow,
    ]
      .filter((value) => value !== undefined && value !== null)
      .join(" ")
      .toLowerCase();

  const filteredExperts = experts
    .filter((expert) => {
      const search = searchQuery.trim().toLowerCase();

      const name = String(
        expert.name ?? expert.full_name ?? "",
      ).toLowerCase();

      const location = String(
        expert.location ?? expert.city ?? "",
      ).toLowerCase();

      const specialization = String(
        expert.specialization ?? expert.expertise ?? "",
      ).toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        location.includes(search) ||
        specialization.includes(search);

      const matchesLocation =
        selectedLocation === "All" ||
        location.includes(selectedLocation.toLowerCase());

      const experience = getExperienceYears(expert.experience);

      const matchesExperience =
        selectedExperience === "All" ||
        (selectedExperience === "0-5" && experience <= 5) ||
        (selectedExperience === "5-10" &&
          experience > 5 &&
          experience <= 10) ||
        (selectedExperience === "10-15" &&
          experience > 10 &&
          experience <= 15) ||
        (selectedExperience === "15+" && experience > 15);

      const fee = getFee(expert);

      const matchesFee =
        selectedFee === "All" ||
        (selectedFee === "Under ₹500" && fee < 500) ||
        (selectedFee === "₹500 - ₹1000" && fee >= 500 && fee <= 1000) ||
        (selectedFee === "₹1000 - ₹2000" && fee > 1000 && fee <= 2000) ||
        (selectedFee === "₹2000+" && fee > 2000);

      const matchesSpecialization =
        selectedSpecialization === "All" ||
        specialization.includes(selectedSpecialization.toLowerCase());

      const languages = getCleanLanguages(expert.languages);

      const matchesLanguage =
        selectedLanguage === "All" ||
        languages.some(
          (language: string) =>
            language.toLowerCase() === selectedLanguage.toLowerCase(),
        );

      const isVerified =
        expert.verified === true ||
        expert.verified === 1 ||
        expert.verified === "true";

      const availabilityText = getAvailabilityText(expert);
      let matchesAvailability = true;

      if (selectedAvailability === "Next 4 Hours") {
        matchesAvailability =
          availabilityText.includes("4 hour") ||
          availabilityText.includes("next 4") ||
          availabilityText.includes("available now");
      }

      if (selectedAvailability === "Today") {
        matchesAvailability =
          availabilityText.includes("today") ||
          availabilityText.includes("available today");
      }

      if (selectedAvailability === "Tomorrow") {
        matchesAvailability =
          availabilityText.includes("tomorrow") ||
          availabilityText.includes("available tomorrow");
      }

      return (
        matchesSearch &&
        matchesLocation &&
        matchesExperience &&
        matchesFee &&
        matchesSpecialization &&
        matchesLanguage &&
        (!verifiedOnly || isVerified) &&
        matchesAvailability
      );
    })
    .sort((a, b) => {
      if (sortBy === "Distance: Near to Far") {
        return getDistance(a) - getDistance(b);
      }

      if (sortBy === "Rating") return getRating(b) - getRating(a);

      if (sortBy === "Experience") {
        return (
          getExperienceYears(b.experience) -
          getExperienceYears(a.experience)
        );
      }

      if (sortBy === "Fee Low to High") return getFee(a) - getFee(b);
      if (sortBy === "Fee High to Low") return getFee(b) - getFee(a);
      if (sortBy === "Reviews") return getReviews(b) - getReviews(a);

      if (sortBy === "Recommended") {
        const verifiedA =
          a.verified === true ||
          a.verified === 1 ||
          a.verified === "true";

        const verifiedB =
          b.verified === true ||
          b.verified === 1 ||
          b.verified === "true";

        if (verifiedA !== verifiedB) {
          return Number(verifiedB) - Number(verifiedA);
        }

        const ratingDifference = getRating(b) - getRating(a);
        if (ratingDifference !== 0) return ratingDifference;

        const reviewDifference = getReviews(b) - getReviews(a);
        if (reviewDifference !== 0) return reviewDifference;

        return (
          getExperienceYears(b.experience) -
          getExperienceYears(a.experience)
        );
      }

      return 0;
    });

  return (
    <div className="vastu-home-page h-[100dvh] w-full max-w-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#FFF8F0]">
      <style>{vastuResponsiveStyles}</style>

      {/* COLLAPSIBLE VASTU HEADER */}
      <div className="vastu-collapsible-header w-full min-w-0 max-w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#7A2600] via-[#B94A0B] to-[#E67E22] text-white">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -right-10 top-10 h-32 w-32 rounded-full border border-white/10" />
          <div className="absolute -left-16 -bottom-20 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative px-4 pt-3 pb-3 sm:px-5">
            {/* IMPORTANT: this row never becomes a column */}
            <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                  <span className="shrink-0 text-base font-serif">ॐ</span>
                  <span className="truncate text-[9px] font-bold uppercase tracking-[0.18em]">
                    Vastu Shastra
                  </span>
                </div>

                <h1 className="text-[21px] font-extrabold leading-tight tracking-tight sm:text-[24px]">
                  Vastu Experts
                </h1>

                <p className="mt-0.5 max-w-[255px] text-[11px] leading-4 text-orange-50/90 sm:text-[12px]">
                  Bring harmony, balance & positive energy to your space.
                </p>
              </div>

              <button
                onClick={() => navigate("/vastu/apply-consultant")}
                className="vastu-become-button mt-0 flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 text-[11px] font-bold text-[#A63F08] shadow-lg active:scale-95 sm:h-10 sm:px-3.5 sm:text-xs"
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>Become</span>
              </button>
            </div>

            {/* COMPASS */}
            <div className="mt-2 flex justify-center">
              <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:h-[82px] sm:w-[82px]">
                <div className="absolute inset-2 rounded-full border border-white/25" />
                <div className="absolute inset-4 rounded-full border border-dashed border-white/25" />

                <span className="absolute top-1 text-[8px] font-bold tracking-widest sm:top-1.5 sm:text-[9px]">
                  N
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold tracking-widest sm:bottom-1.5 sm:text-[9px]">
                  S
                </span>
                <span className="absolute left-1.5 text-[8px] font-bold tracking-widest sm:left-2 sm:text-[9px]">
                  W
                </span>
                <span className="absolute right-1.5 text-[8px] font-bold tracking-widest sm:right-2 sm:text-[9px]">
                  E
                </span>

                <div className="absolute h-10 w-px rotate-45 bg-white/80 sm:h-11" />
                <div className="absolute h-10 w-px -rotate-45 bg-white/50 sm:h-11" />

                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1DD] text-[#A63F08] shadow-lg sm:h-9 sm:w-9">
                  <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>

                <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#FFD166]" />
              </div>
            </div>
          </div>
        </div>

        {/* SERVICE IDENTITY */}
        <div className="relative -mt-2 px-4 sm:px-5">
          <div className="rounded-2xl border border-[#F0C49D] bg-[#FFFDF9] p-2.5 shadow-[0_6px_18px_rgba(122,38,0,0.10)]">
            <div className="grid grid-cols-3 gap-1.5 text-center sm:gap-2">
              <VastuFeature
                icon={<Home className="h-5 w-5" />}
                label="Home Vastu"
              />
              <VastuFeature
                icon={<Compass className="h-5 w-5" />}
                label="Direction"
              />
              <VastuFeature
                icon={<Sparkles className="h-5 w-5" />}
                label="Energy Balance"
              />
            </div>
          </div>
        </div>

        {/* QUICK MESSAGE */}
        <div className="px-4 pt-2.5 pb-1 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#F2D2B3] bg-[#FFF0DD] px-3 py-2.5 sm:gap-2.5 sm:px-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C65312] text-white">
              <span className="font-serif text-xl">ॐ</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#7A2600]">
                Align your space with Vastu
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-[#8C5A38] sm:text-[11px]">
                Consult verified experts for homes, offices, plots & more.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* SEARCH / FILTER BAR */}
      <div className="sticky top-0 z-40 w-full border-b border-[#F0C49D] bg-[#FFF8F0]/95 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B96A38]" />
            <input
              type="text"
              placeholder="Search Vastu expert, city or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full min-w-0 rounded-2xl border border-[#E8C6A9] bg-white pl-11 pr-3 text-[16px] outline-none transition focus:border-[#C65312] focus:ring-2 focus:ring-[#C65312]/15 sm:pr-4 sm:text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#B94A0B] text-white shadow-md shadow-[#B94A0B]/20 active:scale-95"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div
          className="fixed inset-0 z-[9999] flex items-end bg-black/50"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="relative z-[10000] flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-t-[28px] bg-[#FFFDF9]"
            style={{
              height: "min(82dvh, 760px)",
              maxHeight: "calc(100dvh - env(safe-area-inset-top))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#E8C6A9] px-4 sm:h-[72px] sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B94A0B]">
                  ॐ Vastu
                </p>
                <h2 className="text-[22px] font-semibold text-[#4E210E] sm:text-[24px]">
                  Filters
                </h2>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                aria-label="Close filters"
              >
                <X className="h-7 w-7 text-[#8C6A58]" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div className="w-[34%] min-w-[112px] max-w-[145px] overflow-y-auto border-r border-[#E8C6A9] bg-[#FFF4E8]">
                {[
                  "Sort By",
                  "Availability",
                  "Location",
                  "Experience",
                  "Fees",
                  "Specialization",
                  "Language",
                  "Verified",
                ].map((label) => (
                  <FilterTab
                    key={label}
                    label={label}
                    active={activeFilter === label}
                    onClick={() => setActiveFilter(label)}
                  />
                ))}
              </div>

              <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5">
                {activeFilter === "Sort By" && (
                  <div className="space-y-3">
                    <FilterOption label="Recommended" selected={sortBy === "Recommended"} onClick={() => setSortBy("Recommended")} />
                    <FilterOption label="Distance: Near to Far" selected={sortBy === "Distance: Near to Far"} onClick={() => setSortBy("Distance: Near to Far")} />
                    <FilterOption label="Rating: High to Low" selected={sortBy === "Rating"} onClick={() => setSortBy("Rating")} />
                    <FilterOption label="Experience: High to Low" selected={sortBy === "Experience"} onClick={() => setSortBy("Experience")} />
                    <FilterOption label="Fee: Low to High" selected={sortBy === "Fee Low to High"} onClick={() => setSortBy("Fee Low to High")} />
                    <FilterOption label="Fee: High to Low" selected={sortBy === "Fee High to Low"} onClick={() => setSortBy("Fee High to Low")} />
                    <FilterOption label="Most Reviews" selected={sortBy === "Reviews"} onClick={() => setSortBy("Reviews")} />
                  </div>
                )}

                {activeFilter === "Availability" && (
                  <div className="space-y-3">
                    <FilterOption label="Available in next 4 hours" selected={selectedAvailability === "Next 4 Hours"} onClick={() => setSelectedAvailability("Next 4 Hours")} />
                    <FilterOption label="Available Today" selected={selectedAvailability === "Today"} onClick={() => setSelectedAvailability("Today")} />
                    <FilterOption label="Available Tomorrow" selected={selectedAvailability === "Tomorrow"} onClick={() => setSelectedAvailability("Tomorrow")} />
                    <FilterOption label="Any Availability" selected={selectedAvailability === "Any"} onClick={() => setSelectedAvailability("Any")} />
                  </div>
                )}

                {activeFilter === "Location" && (
                  <div className="space-y-3">
                    {["All", "Delhi", "Noida", "Gurgaon", "Ghaziabad", "Bulandshahr", "Varanasi"].map((location) => (
                      <FilterOption
                        key={location}
                        label={location === "All" ? "All Locations" : location}
                        selected={selectedLocation === location}
                        onClick={() => setSelectedLocation(location)}
                      />
                    ))}
                  </div>
                )}

                {activeFilter === "Experience" && (
                  <div className="space-y-3">
                    <FilterOption label="Any Experience" selected={selectedExperience === "All"} onClick={() => setSelectedExperience("All")} />
                    <FilterOption label="0 - 5 Years" selected={selectedExperience === "0-5"} onClick={() => setSelectedExperience("0-5")} />
                    <FilterOption label="5 - 10 Years" selected={selectedExperience === "5-10"} onClick={() => setSelectedExperience("5-10")} />
                    <FilterOption label="10 - 15 Years" selected={selectedExperience === "10-15"} onClick={() => setSelectedExperience("10-15")} />
                    <FilterOption label="15+ Years" selected={selectedExperience === "15+"} onClick={() => setSelectedExperience("15+")} />
                  </div>
                )}

                {activeFilter === "Fees" && (
                  <div className="space-y-3">
                    <FilterOption label="Any Fee" selected={selectedFee === "All"} onClick={() => setSelectedFee("All")} />
                    <FilterOption label="Under ₹500" selected={selectedFee === "Under ₹500"} onClick={() => setSelectedFee("Under ₹500")} />
                    <FilterOption label="₹500 - ₹1,000" selected={selectedFee === "₹500 - ₹1000"} onClick={() => setSelectedFee("₹500 - ₹1000")} />
                    <FilterOption label="₹1,000 - ₹2,000" selected={selectedFee === "₹1000 - ₹2000"} onClick={() => setSelectedFee("₹1000 - ₹2000")} />
                    <FilterOption label="₹2,000+" selected={selectedFee === "₹2000+"} onClick={() => setSelectedFee("₹2000+")} />
                  </div>
                )}

                {activeFilter === "Specialization" && (
                  <div className="space-y-3">
                    {["All", "Residential", "Commercial", "Industrial", "Other"].map((item) => (
                      <FilterOption
                        key={item}
                        label={item === "All" ? "All Specializations" : item}
                        selected={selectedSpecialization === item}
                        onClick={() => setSelectedSpecialization(item)}
                      />
                    ))}
                  </div>
                )}

                {activeFilter === "Language" && (
                  <div className="space-y-3">
                    {["All", "Hindi", "English", "Sanskrit"].map((language) => (
                      <FilterOption
                        key={language}
                        label={language === "All" ? "All Languages" : language}
                        selected={selectedLanguage === language}
                        onClick={() => setSelectedLanguage(language)}
                      />
                    ))}
                  </div>
                )}

                {activeFilter === "Verified" && (
                  <div className="space-y-3">
                    <FilterOption label="Verified Experts Only" selected={verifiedOnly} onClick={() => setVerifiedOnly(true)} />
                    <FilterOption label="All Experts" selected={!verifiedOnly} onClick={() => setVerifiedOnly(false)} />
                  </div>
                )}
              </div>
            </div>

            <div
              className="shrink-0 border-t border-[#E8C6A9] bg-[#FFFDF9] px-4 pt-3 sm:px-6"
              style={{
                paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setSelectedLocation("All");
                    setSelectedExperience("All");
                    setSelectedFee("All");
                    setSelectedSpecialization("All");
                    setSelectedLanguage("All");
                    setSelectedAvailability("Any");
                    setVerifiedOnly(false);
                    setSortBy("Recommended");
                    setActiveFilter("Availability");
                  }}
                  className="h-12 min-w-0 flex-1 font-medium text-sm text-[#B94A0B] underline sm:text-base"
                >
                  Clear All
                </button>

                <button
                  onClick={() => setShowFilters(false)}
                  className="h-12 min-w-0 flex-[1.8] rounded-xl bg-[#B94A0B] font-semibold text-white shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPERT LIST */}
      <div className="vastu-expert-content min-w-0 w-full max-w-full px-3 py-3 pb-32 sm:px-5">
        <div className="mb-4 flex min-w-0 items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#B94A0B]">
              Trusted Guidance
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-[#4E210E] sm:text-xl">
              Find Your Vastu Expert
            </h2>
          </div>
          <div className="shrink-0 rounded-full bg-[#FFF0DD] px-2.5 py-1 text-[10px] font-semibold text-[#A63F08] sm:px-3 sm:text-[11px]">
            {isLoadingExperts ? "Loading..." : `${filteredExperts.length} experts`}
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingExperts ? (
            <div className="rounded-3xl border border-[#F0C49D] bg-white py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
                <Compass className="h-8 w-8" />
              </div>
              <p className="font-semibold text-[#4E210E]">
                Finding Vastu experts...
              </p>
              <p className="mt-1 px-5 text-sm text-[#8C6A58]">
                Please wait while we load nearby consultants.
              </p>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="rounded-3xl border border-[#F0C49D] bg-white py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0DD] text-[#B94A0B]">
                <Compass className="h-8 w-8" />
              </div>
              <p className="font-semibold text-[#4E210E]">No experts found</p>
              <p className="mt-1 px-5 text-sm text-[#8C6A58]">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            filteredExperts.map((expert) => {
              const distance = getDistance(expert);
              const expertName = expert.name ?? expert.full_name ?? "Vastu Expert";
              const expertSpecialization =
                expert.specialization ??
                expert.expertise ??
                "Vastu Consultant";
              const expertLocation =
                expert.location ?? expert.city ?? "Location unavailable";
              const expertFee = getFee(expert);

              return (
                <button
                  key={expert.id}
                  onClick={() => navigate(`/vastu/expert/${expert.id}`)}
                  className="group block w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-[#EBC7A8] bg-white p-3.5 text-left shadow-[0_5px_18px_rgba(122,38,0,0.07)] transition-all active:scale-[0.995] sm:p-4"
                >
                  <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 max-w-[70%] items-center gap-1 truncate rounded-full bg-[#FFF0DD] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#A63F08]">
                      <span className="shrink-0">ॐ</span>
                      <span className="truncate">Vastu Consultant</span>
                    </span>

                    {expert.verified && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#9A4B17]">
                        <BadgeCheck className="h-4 w-4 shrink-0" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={
                          expert.image ||
                          expert.photo ||
                          "https://via.placeholder.com/200"
                        }
                        alt={expertName}
                        className="h-[72px] w-[72px] rounded-2xl border-2 border-[#F2D2B3] object-cover sm:h-20 sm:w-20"
                      />

                      {expert.verified && (
                        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#C65312] shadow">
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[16px] font-bold text-[#4E210E] sm:text-[17px]">
                        {expertName}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-xs text-[#8C6A58] sm:text-sm">
                        {expertSpecialization}
                      </p>

                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] text-[#8C6A58] sm:gap-2 sm:text-[11px]">
                        <span className="shrink-0 rounded-full bg-[#FFF7EE] px-2 py-1">
                          {expert.experience ?? 0} exp.
                        </span>

                        <span className="flex min-w-0 items-center gap-1 rounded-full bg-[#FFF7EE] px-2 py-1">
                          <Star className="h-3 w-3 shrink-0 fill-[#E5A51C] text-[#E5A51C]" />
                          <span className="truncate">
                            {getRating(expert).toFixed(1)} 
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 border-t border-[#F2D2B3] pt-3">
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wide text-[#A47A61]">
                        Consultation
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-[#B94A0B]">
                        ₹{expertFee.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wide text-[#A47A61]">
                        Languages
                      </p>
                      <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-[#6E5648]">
                        <Languages className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {getCleanLanguages(expert.languages).join(", ") ||
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex min-w-0 items-center gap-1 text-xs text-[#7B6557]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C65312]" />
                    <span className="min-w-0 flex-1 truncate">{expertLocation}</span>

                    {Number.isFinite(distance) && (
                      <span className="shrink-0 font-semibold text-[#B94A0B]">
                        • {distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#FFF5E9] px-3 py-3 sm:px-4">
                    <span className="min-w-0 truncate text-[11px] font-bold text-[#A63F08] sm:text-xs">
                      View Profile & Book Consultation
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#B94A0B]" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* SAFE-AREA BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}

const vastuResponsiveStyles = `
  .vastu-home-page,
  .vastu-home-page * {
    box-sizing: border-box;
  }

  .vastu-home-page {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
  }

  .vastu-home-page img,
  .vastu-home-page svg {
    max-width: 100%;
  }

  .vastu-home-page button,
  .vastu-home-page input {
    max-width: 100%;
  }

  .vastu-home-page {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .vastu-home-page::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .vastu-bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }

  @media (max-width: 380px) {
    .vastu-become-button {
      padding-left: 9px !important;
      padding-right: 9px !important;
      font-size: 10px !important;
    }

    .vastu-become-button svg {
      width: 14px;
      height: 14px;
    }

    .vastu-home-page .vastu-expert-content {
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  @media (max-width: 340px) {
    .vastu-home-page .vastu-become-button span {
      max-width: 42px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vastu-home-page .vastu-expert-content {
      padding-left: 8px;
      padding-right: 8px;
    }
  }

  @media (min-width: 640px) {
    .vastu-home-page {
      max-width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .vastu-home-page * {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`;

function VastuFeature({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-[#A63F08]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DD]">
        {icon}
      </div>
      <span className="truncate text-[9px] font-bold">{label}</span>
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative min-h-[58px] w-full min-w-0 border-b border-[#E8C6A9] px-3 text-left text-xs transition-colors sm:min-h-[64px] sm:px-4 sm:text-sm ${
        active
          ? "bg-[#FFFDF9] font-semibold text-[#B94A0B]"
          : "text-[#8C6A58]"
      }`}
    >
      {active && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#B94A0B]" />
      )}
      <span className="break-words">{label}</span>
    </button>
  );
}

function FilterOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[48px] w-full min-w-0 rounded-xl border px-3 py-3 text-left transition-all sm:px-4 ${
        selected
          ? "border-[#C65312] bg-[#FFF0DD] font-medium text-[#A63F08]"
          : "border-[#E8C6A9] bg-white text-[#4E210E]"
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
        <span className="min-w-0 break-words text-sm">{label}</span>

        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? "border-[#B94A0B] bg-[#B94A0B]"
              : "border-[#B99A86]"
          }`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}
