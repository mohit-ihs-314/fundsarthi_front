import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
} from "lucide-react";

import { GradientButton } from "../../components/ui/gradient-button";

// Shared across the app: PropertyListing, PropertyDetail and Wishlist all
// read/write this same key so a favourite toggled on any of them is
// reflected everywhere else without a reload.
const WISHLIST_KEY = "savedProperties";

export default function Wishlist() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");

      if (!Array.isArray(saved)) {
        setProperties([]);
        return;
      }

      setProperties(saved);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Keep in sync if a favourite is toggled elsewhere (listing card,
  // property detail page) while this page is open.
  useEffect(() => {
    window.addEventListener("wishlistUpdated", loadWishlist);
    window.addEventListener("storage", loadWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, [loadWishlist]);

  const removeFromWishlist = (id: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");

      const next = saved.filter(
        (property: any) => String(property.id) !== String(id),
      );

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));

      setProperties(next);

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Failed to remove wishlist property:", error);
    }
  };

  const handleShare = async (property: any) => {
    const extra = property?.features?.extra || {};
    const projectName = extra.project_name || property?.title || "Property";

    const priceLine = property?.price ? `₹${property.price}` : "";
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
        [priceLine, locationLine].filter(Boolean).join(" • "),
      ]
        .filter(Boolean)
        .join("\n") + contactLine;

    const url = `${window.location.origin}/property/${property.id}`;
    const shareData = { title: projectName, text: shareText, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share sheet - no-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      alert("Link copied to clipboard");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* HEADER */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Wishlist</h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading...
          </div>
        ) : properties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
            <Heart className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              You haven't saved any properties yet.
            </p>
            <GradientButton onClick={() => navigate("/property")}>
              Browse Properties
            </GradientButton>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {properties.map((property) => {
              const extra = property?.features?.extra || {};
              const thumb = property?.photos?.[0];

              return (
                <div
                  key={property.id}
                  className="bg-card border rounded-2xl overflow-hidden shadow-sm"
                >
                  <div
                    className="flex gap-3 p-3 cursor-pointer"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <img
                      src={thumb || "https://via.placeholder.com/200x200"}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {extra.project_name || property.title}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        ₹{property.price}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        {property.beds && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3" /> {property.beds}
                          </span>
                        )}
                        {property.baths && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3 h-3" /> {property.baths}
                          </span>
                        )}
                        {property.area && (
                          <span className="flex items-center gap-1">
                            <Square className="w-3 h-3" /> {property.area}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-border">
                    <button
                      onClick={() => handleShare(property)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => removeFromWishlist(String(property.id))}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
