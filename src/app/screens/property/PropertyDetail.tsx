import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Share } from "@capacitor/share";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Phone,
  Mail,
  Share2,
  Heart,
  Wifi,
  Dumbbell,
  Waves,
  Shield,
  Zap,
  Building,
  Trees,
} from "lucide-react";

import { GradientButton } from "../../components/ui/gradient-button";
import { Button } from "../../components/ui/button";

// Shared across the app: PropertyListing, PropertyDetail and Wishlist all
// read/write this same key so a favourite toggled on any of them is
// reflected everywhere else without a reload.
const WISHLIST_KEY = "savedProperties";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [enquiry, setEnquiry] = useState({
    name: "",
    mobile: "",
    email: "",
    visit_date: "",
    visit_time: "",
    message: "",
  });

  useEffect(() => {
    fetch(`https://api.fundsarthi.in/api/property/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "error" || !data) {
          setProperty(null);
          setLoadError(true);
        } else {
          setProperty(data.data || data);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isSavedProperty = (saved: any[], propertyId: string) => {
    if (!Array.isArray(saved)) return false;

    return saved.some((item: any) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item) === propertyId;
      }

      if (item && typeof item === "object") {
        const savedId = item.id ?? item._id;
        return savedId != null && String(savedId) === propertyId;
      }

      return false;
    });
  };

  useEffect(() => {
    if (!id) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem(WISHLIST_KEY) || "[]"
      );

      setIsFavorite(isSavedProperty(saved, String(id)));
    } catch (error) {
      console.error("Failed to read wishlist:", error);
      setIsFavorite(false);
    }
  }, [id]);

  // Keep this page's heart icon correct if the same property is
  // favourited/unfavourited elsewhere.
  useEffect(() => {
    if (!id) return;

    const syncFromStorage = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(WISHLIST_KEY) || "[]"
        );

        setIsFavorite(isSavedProperty(saved, String(id)));
      } catch (error) {
        console.error("Failed to sync wishlist:", error);
        setIsFavorite(false);
      }
    };

    window.addEventListener("wishlistUpdated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("wishlistUpdated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [id]);

  const toggleFavorite = () => {
    if (!property) return;

    try {
      const raw = JSON.parse(
        localStorage.getItem(WISHLIST_KEY) || "[]"
      );

      const saved = Array.isArray(raw) ? raw : [];
      const propertyId = String(property.id ?? property._id);
      const exists = isSavedProperty(saved, propertyId);

      const next = exists
        ? saved.filter((item: any) => {
            if (typeof item === "string" || typeof item === "number") {
              return String(item) !== propertyId;
            }

            if (item && typeof item === "object") {
              const savedId = item.id ?? item._id;
              return String(savedId) !== propertyId;
            }

            return true;
          })
        : [...saved, property];

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(next)
      );

      setIsFavorite(!exists);

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Wishlist update failed:", error);
    }
  };

  const handleShare = async () => {
    if (!property) return;

    const extraForShare = property?.features?.extra || {};

    const projectName =
      extraForShare.project_name ||
      property?.title ||
      "Property";

    const priceLine = property?.price
      ? `₹${property.price}`
      : "";

    const locationLine = property?.location || "";

    const brokerName = property?.name?.trim();
    const brokerMobile = property?.mobile?.trim();

    const contactLine =
      brokerName || brokerMobile
        ? `\n\nContact: ${brokerName || "Fundsarthi Advisor"}${
            brokerMobile ? ` - ${brokerMobile}` : ""
          }`
        : "";

    const shareText =
      [
        "Check out this property on Fundsarthi:",
        projectName,
        [priceLine, locationLine]
          .filter(Boolean)
          .join(" • "),
      ]
        .filter(Boolean)
        .join("\n") + contactLine;

    try {
      await Share.share({
        title: projectName,
        text: shareText,
        url: window.location.href,
        dialogTitle: "Share Property",
      });
    } catch (error: any) {
      // Closing/cancelling the native share sheet is expected.
      const message = String(error?.message || "").toLowerCase();

      if (
        !message.includes("cancel") &&
        !message.includes("canceled") &&
        !message.includes("cancelled")
      ) {
        console.error("Native share failed:", error);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (loadError || !property) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-muted-foreground">
          We couldn't load this property. It may have been removed, or there was
          a network issue.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const isVideo = (url: string) => url?.includes("/video/");

  // ✅ MEDIA SAFE
  const media = [...(property.photos || []), ...(property.videos || [])];

  const extra = property?.features?.extra || {};

  // ✅ FEATURES SAFE PARSE
  const highlights = property?.features?.highlights || [];
  const facilities = property?.features?.facilities || [];
  const amenities = [...highlights, ...facilities];

  // ✅ ICON MAP
  const amenityIcons: any = {
    gym: <Dumbbell className="w-4 h-4" />,
    "swimming pool": <Waves className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    "power backup": <Zap className="w-4 h-4" />,
    lift: <Building className="w-4 h-4" />,
    garden: <Trees className="w-4 h-4" />,
    wifi: <Wifi className="w-4 h-4" />,
  };

  const getIcon = (name: string) => {
    return (
      amenityIcons[name?.toLowerCase()] || <Building className="w-4 h-4" />
    );
  };

  const validateEmail = (email) => {
    // Proper email format
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;

    // Reject fake/too short emails like y@g.com
    const [username, domain] = email.split("@");

    if (
      !emailRegex.test(email) ||
      username.length < 3 ||
      domain.split(".")[0].length < 2
    ) {
      return false;
    }

    return true;
  };

  const handleSubmitEnquiry = async () => {
    // Name validation
    if (!enquiry.name?.trim()) {
      alert("Name is required");
      return;
    }

    // Mobile validation
    if (!/^\d{10}$/.test(enquiry.mobile)) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    // Email validation
    if (!enquiry.email?.trim()) {
      alert("Email is required");
      return;
    }

    if (!validateEmail(enquiry.email)) {
      alert("Please enter a valid email");
      return;
    }

    if (!enquiry.visit_date) {
      alert("Please select a preferred visit date");
      return;
    }

    if (!enquiry.visit_time) {
      alert("Please select a preferred visit time");
      return;
    }

    const payload = {
      ...enquiry,
      property_id: property.id,
      property_title: property.title,
    };

    try {
      const res = await fetch("https://api.fundsarthi.in/api/schedule-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Enquiry submitted!");

        setEnquiry({
          name: "",
          mobile: "",
          email: "",
          visit_date: "",
          visit_time: "",
          message: "",
        });

        setShowForm(false);
      } else {
        alert("Failed to submit enquiry");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFavorite}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
                isFavorite ? "text-red-500" : "text-foreground"
              }`}
              fill={isFavorite ? "#ef4444" : "none"}
              stroke={isFavorite ? "#ef4444" : "currentColor"}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* 🔥 SLIDER */}
        <div className="relative h-64 bg-muted overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {media.length > 0 ? (
              media.map((item: string, i: number) =>
                isVideo(item) ? (
                  <video
                    key={i}
                    src={item}
                    className="w-full h-full object-cover flex-shrink-0"
                    onClick={() => {
                      setActiveIndex(i);
                      setShowPreview(true);
                    }}
                    muted
                  />
                ) : (
                  <img
                    key={i}
                    src={item}
                    className="w-full h-full object-cover flex-shrink-0"
                    onClick={() => {
                      setActiveIndex(i);
                      setShowPreview(true);
                    }}
                  />
                ),
              )
            ) : (
              <img
                src="https://via.placeholder.com/800x600"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* LEFT BUTTON */}
          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              ‹
            </button>
          )}

          {/* RIGHT BUTTON */}
          {activeIndex < media.length - 1 && (
            <button
              onClick={() => setActiveIndex(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              ›
            </button>
          )}

          {/* DOTS */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {media.map((_: any, i: number) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="text-2xl font-bold text-primary">
              {extra.project_name || property.title}
            </div>

            {extra.builder && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                By {extra.builder}
              </div>
            )}

            <h1 className="text-xl font-medium mt-1">₹{property.price}</h1>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon: Bed, label: "Beds", value: property.beds },
              { icon: Bath, label: "Baths", value: property.baths },
              { icon: Square, label: "Area", value: property.area },
              { icon: Car, label: "Parking", value: property.parking || "N/A" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border rounded-xl p-3 text-center shadow-sm"
              >
                <item.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-sm font-medium">{item.value || "-"}</div>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              {property.description || "No description available"}
            </p>
          </div>

          {/* MAP */}
          <div className="mb-6">
            <h3 className="mb-2 font-medium">Location</h3>
            <iframe
              width="100%"
              height="200"
              className="rounded-xl border"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                property.location,
              )}&output=embed`}
            />
          </div>

          {/* ✅ PREMIUM AMENITIES */}
          <div className="mb-6">
            <h3 className="mb-3 font-medium">Amenities</h3>

            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((feature: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-card border rounded-xl px-3 py-2 shadow-sm"
                  >
                    <div className="text-primary">{getIcon(feature)}</div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No amenities listed
              </p>
            )}
          </div>

          {/* 🔥 ADDITIONAL DETAILS */}
          <div className="mb-6">
            <h3 className="mb-3 font-medium">Property Details</h3>

            <div className="grid grid-cols-2 gap-3">
              {extra.project_name && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="text-sm font-medium">{extra.project_name}</p>
                </div>
              )}

              {extra.floor_number && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Floor</p>
                  <p className="text-sm font-medium">{extra.floor_number}</p>
                </div>
              )}

              {extra.balconies && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Balconies</p>
                  <p className="text-sm font-medium">{extra.balconies}</p>
                </div>
              )}

              {extra.furnishing && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Furnishing</p>
                  <p className="text-sm font-medium capitalize">
                    {extra.furnishing}
                  </p>
                </div>
              )}

              {extra.construction_status && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">
                    {extra.construction_status}
                  </p>
                </div>
              )}

              {extra.possession && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Possession</p>
                  <p className="text-sm font-medium">{extra.possession}</p>
                </div>
              )}

              {extra.power_backup && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Power Backup</p>
                  <p className="text-sm font-medium capitalize">
                    {extra.power_backup}
                  </p>
                </div>
              )}

              {extra.owner_type && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Owner Type</p>
                  <p className="text-sm font-medium capitalize">
                    {extra.owner_type}
                  </p>
                </div>
              )}

              {extra.plot_area && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Plot Area</p>
                  <p className="text-sm font-medium">{extra.plot_area} sq yd</p>
                </div>
              )}

              {extra.frontage && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Frontage</p>
                  <p className="text-sm font-medium">{extra.frontage} ft</p>
                </div>
              )}

              {extra.road_width && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Road Width</p>
                  <p className="text-sm font-medium">{extra.road_width} ft</p>
                </div>
              )}

              {extra.dimensions && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <p className="text-sm font-medium">{extra.dimensions}</p>
                </div>
              )}

              {extra.washrooms && (
                <div className="bg-card border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Washrooms</p>
                  <p className="text-sm font-medium">{extra.washrooms}</p>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-card border rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="mb-4 font-medium">Contact Owner</h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-lg font-medium">
                  {property.name?.charAt(0) || "U"}
                </span>
              </div>

              <div>
                <p className="font-medium">{property.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">Property Owner</p>
              </div>
            </div>

            <div className="flex gap-2">
              <GradientButton
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() =>
                  property.mobile && window.open(`tel:${property.mobile}`)
                }
              >
                <Phone className="w-4 h-4" />
                Call
              </GradientButton>

              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2"
                onClick={() =>
                  property.email && window.open(`mailto:${property.email}`)
                }
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <GradientButton className="w-full" onClick={() => setShowForm(true)}>
          Schedule Site Visit
        </GradientButton>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">
            <h3 className="mb-4 font-medium">Schedule Visit</h3>

            {/* Name */}
            <input
              type="text"
              required
              placeholder="Name *"
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.name || ""}
              onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
            />

            {/* Mobile */}
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="Mobile *"
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.mobile || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setEnquiry({ ...enquiry, mobile: value });
              }}
            />

            {/* Email */}
            <input
              type="email"
              required
              placeholder="Email *"
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.email || ""}
              onChange={(e) =>
                setEnquiry({ ...enquiry, email: e.target.value })
              }
            />

            {/* Preferred Visit Date */}
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.visit_date || ""}
              onChange={(e) =>
                setEnquiry({ ...enquiry, visit_date: e.target.value })
              }
            />

            {/* Preferred Visit Time */}
            <input
              type="time"
              required
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.visit_time || ""}
              onChange={(e) =>
                setEnquiry({ ...enquiry, visit_time: e.target.value })
              }
            />

            {/* Message Optional */}
            <textarea
              placeholder="Message"
              className="w-full mb-3 border p-2 rounded"
              value={enquiry.message || ""}
              onChange={(e) =>
                setEnquiry({ ...enquiry, message: e.target.value })
              }
            />

            <div className="flex gap-2">
              <button
                className="flex-1 bg-gray-200 p-2 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 bg-primary text-white p-2 rounded"
                onClick={handleSubmitEnquiry}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 FULLSCREEN PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 bg-black z-50 overflow-hidden">
          {/* CLOSE */}
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 text-white text-2xl z-[999]"
          >
            ✕
          </button>

          {/* SLIDER */}
          <div
            className="flex h-full items-center transition-transform duration-300"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {media.map((item: string, i: number) =>
              isVideo(item) ? (
                <video
                  key={i}
                  src={item}
                  controls
                  className="w-full h-full object-contain flex-shrink-0"
                />
              ) : (
                <img
                  key={i}
                  src={item}
                  className="w-full h-full object-contain flex-shrink-0"
                />
              ),
            )}
          </div>
          {/* PREVIOUS */}
          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[999] w-12 h-12 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center"
            >
              ‹
            </button>
          )}

          {/* NEXT */}
          {activeIndex < media.length - 1 && (
            <button
              onClick={() => setActiveIndex(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[999] w-12 h-12 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
