import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { GradientButton } from "../../components/ui/gradient-button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, X, Image as ImageIcon, Video, FileText } from "lucide-react";
import { NCR_CITIES } from "../../utils/constants";

export default function ListYourProperty() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const mobile = localStorage.getItem("userMobile");
      if (!mobile) return;

      const res = await fetch(`https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`);
      const data = await res.json();

      if (data.status === "success") {
        setFormData(prev => ({
          ...prev,
          name: data.data.name,
          mobile: data.data?.mobile || mobile,
          email: data.data.email || ""
        }));
      }
    };

    fetchUser();
  }, []);

  // ✅ CLEAN + FULL STATE
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    propertyType: "",
    purpose: "",
    city: "",
    locality: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    name: "",
    mobile: "",
    email: "",

    // 🔥 added fields (backend ready)
    projectName: "",
    balconies: "",
    floorNumber: "",
    furnishingStatus: "",
    parking: "",
    powerBackup: "",
    constructionStatus: "",
    possession: "",
    builder: "",
    ownerType: "",

    // category-specific fields (Plot / Commercial / SCO)
    plotArea: "",
    frontage: "",
    roadWidth: "",
    dimensions: "",
    washrooms: "",

    // geotagging - auto-detected on load, editable manually below
    latitude: "",
    longitude: ""
  });

  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) return;

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        }));
        setDetectingLocation(false);
      },
      () => setDetectingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Silently attempt to auto-tag location on load; falls back to manual
  // entry (below) if denied/unavailable - never blocks the listing flow.
  useEffect(() => {
    detectLocation();
  }, []);

  const [highlights, setHighlights] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  // Residential listings benefit from more photos (rooms, interiors);
  // Plot/Commercial/SCO don't have the same number of distinct spaces to show
  const MIN_IMAGES_BY_CATEGORY: Record<string, number> = {
    residential: 6,
    plot: 3,
    commercial: 4,
    sco: 4,
  };
  const MIN_IMAGES = MIN_IMAGES_BY_CATEGORY[formData.category] ?? 4;
  const [videos, setVideos] = useState<string[]>([]);
  const [floorPlans, setFloorPlans] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);


  const totalSteps = 4;

  const progress =
    (step / totalSteps) * 100;

  useEffect(() => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  // =========================
  // COMMON UPLOAD FUNCTION
  // =========================
  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("https://api.fundsarthi.in/api/upload-image", {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    return data?.status === "success" ? data.url : null;
  };

  const handlePhotoUpload = async (e) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setUploading(true);

    for (let file of files) {
      // ✅ TYPE CHECK (only jpg/png)
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPG or PNG images are allowed");
        continue;
      }

      // ✅ SIZE CHECK (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB");
        continue;
      }

      const url = await uploadFile(file);
      if (url) setPhotos(prev => [...prev, url]);
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleVideoUpload = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large (max 10MB)");
        continue;
      }

      const url = await uploadFile(file);
      if (url) setVideos(prev => [...prev, url]);
    }

    e.target.value = "";
  };

  const handleFloorPlanUpload = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (let file of files) {
      const url = await uploadFile(file);
      if (url) setFloorPlans(prev => [...prev, url]);
    }

    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeFloorPlan = (index: number) => {
    setFloorPlans(prev => prev.filter((_, i) => i !== index));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (photos.length < MIN_IMAGES) {
      alert(
        `Please upload at least ${MIN_IMAGES} property images to continue.`
      );
      return;
    }
    if (!isFormValid) return;

    try {
      const payload = {
        ...formData,

        // defaults for new fields
        projectName: formData.projectName || "",
        balconies: formData.balconies || "0",
        floorNumber: formData.floorNumber || "",
        furnishingStatus: formData.furnishingStatus || "Not Provided",
        parking: formData.parking || "Unknown",
        powerBackup: formData.powerBackup || "No",
        constructionStatus: formData.constructionStatus || "",
        possession: formData.possession || "",
        builder: formData.builder || "",
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,

        photos,
        videos,
        floorPlans,

        features: {
          highlights: highlights,
          facilities: facilities
        }
      };

      const res = await fetch("https://api.fundsarthi.in/api/add-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === "success") {
        navigate(`/property/submit-success/${data.property_id}`);
      } else {
        alert(data.message || "Failed to submit");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const categoryFieldsValid = () => {
    if (formData.category === "residential") {
      return !!(formData.bedrooms && formData.bathrooms);
    }
    if (formData.category === "plot") {
      return !!(formData.plotArea && formData.frontage && formData.roadWidth && formData.dimensions);
    }
    if (formData.category === "commercial" || formData.category === "sco") {
      return !!(formData.floorNumber && formData.washrooms && formData.parking);
    }
    return true;
  };

  const isFormValid =
    formData.title &&
    formData.category &&
    formData.propertyType &&
    formData.purpose &&
    formData.city &&
    formData.locality &&
    formData.price &&
    formData.size &&
    categoryFieldsValid() &&
    (formData.ownerType !== "builder" || formData.builder) &&
    formData.description &&
    formData.name &&
    formData.mobile;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 pt-4 pb-5 bg-white border-b border-gray-100 sticky top-0 z-40">

        {/* Top */}
        <div className="flex items-center mb-4">

          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigate(-1);
              }
            }}
            className="text-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="ml-4 flex-1">
            <h1 className="text-lg font-semibold">
              List Your Property
            </h1>

            <p className="text-xs text-gray-400">
              Step {step} of {totalSteps}
            </p>
          </div>

          <div className="text-sm font-semibold text-primary">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm">

              <h2 className="text-xl font-semibold mb-1">
                Basic Details
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Add your property basics
              </p>

              <div className="space-y-4">

                {/* Property Title */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Property Title *
                  </label>

                  <Input
                    placeholder="e.g., Spacious 3BHK Apartment in Prime Location"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value
                      })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Owner Type */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Owner Type *
                  </label>

                  <Select
                    value={formData.ownerType || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        ownerType: value,
                        builder: value === "builder" ? formData.builder : ""
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select owner type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="builder">Builder / Developer</SelectItem>
                      <SelectItem value="individual">Individual Owner</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Builder - only required when Owner Type is Builder/Developer */}
                {formData.ownerType === "builder" && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Builder Name *
                    </label>

                    <Input
                      placeholder="e.g., DLF"
                      value={formData.builder || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          builder: e.target.value
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Property Category *
                  </label>

                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value,
                        propertyType: "" // reset when category changes
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="residential">
                        Residential
                      </SelectItem>

                      <SelectItem value="commercial">
                        Commercial
                      </SelectItem>

                      <SelectItem value="sco">
                        SCO
                      </SelectItem>

                      <SelectItem value="plot">
                        Plot
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                {formData.category && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Property Type *
                    </label>

                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          propertyType: value
                        })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>

                      <SelectContent>

                        {/* Residential */}
                        {formData.category === "residential" && (
                          <>
                            <SelectItem value="apartment">
                              Apartment
                            </SelectItem>

                            <SelectItem value="land/plot">
                              Land/Plot
                            </SelectItem>

                            <SelectItem value="house/villa">
                              House/Villa
                            </SelectItem>

                            <SelectItem value="builder-floor">
                              Builder Floor
                            </SelectItem>

                            <SelectItem value="studio-apartment/service-apartment">
                              Studio Apartment/Service Apartment
                            </SelectItem>
                          </>
                        )}

                        {/* Commercial */}
                        {formData.category === "commercial" && (
                          <>
                            <SelectItem value="office-space">
                              Office Space
                            </SelectItem>

                            <SelectItem value="shop">
                              Shop
                            </SelectItem>

                            <SelectItem value="showroom">
                              Showroom
                            </SelectItem>

                            <SelectItem value="warehouse">
                              Warehouse
                            </SelectItem>

                            <SelectItem value="industrial-land">
                              Industrial Land
                            </SelectItem>

                            <SelectItem value="commercial-plot">
                              Commercial Plot
                            </SelectItem>

                            <SelectItem value="co-working">
                              Co-working Space
                            </SelectItem>
                          </>
                        )}

                        {/* SCO */}
                        {formData.category === "sco" && (
                          <>
                            <SelectItem value="sco">
                              SCO
                            </SelectItem>
                          </>
                        )}

                        {/* Plot */}
                        {formData.category === "plot" && (
                          <>
                            <SelectItem value="residential-plot">
                              Residential Plot
                            </SelectItem>

                            <SelectItem value="commercial-plot">
                              Commercial Plot
                            </SelectItem>
                          </>
                        )}

                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Purpose */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Purpose *
                  </label>

                  <Select
                    value={formData.purpose || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        purpose: value
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="sell">
                        Sell
                      </SelectItem>

                      <SelectItem value="rent">
                        Rent
                      </SelectItem>

                      <SelectItem value="lease">
                        Lease
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                {/* City */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    City *
                  </label>

                  <Select
                    value={formData.city || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        city: value
                      })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>

                    <SelectContent>
                      {NCR_CITIES.map((city) => (
                        <SelectItem key={city} value={city.toLowerCase()}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Locality */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Locality / Area *
                  </label>

                  <Input
                    placeholder="e.g., Sector 48"
                    value={formData.locality || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locality: e.target.value
                      })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Geotagging - auto-detected, editable manually */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">
                      Map Location
                    </label>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      className="text-xs font-medium text-primary"
                    >
                      {detectingLocation ? "Detecting..." : "📍 Detect My Location"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Latitude"
                      value={formData.latitude || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="h-12 rounded-xl"
                    />
                    <Input
                      placeholder="Longitude"
                      value={formData.longitude || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-filled when location access is available. Edit if this
                    isn't the property's actual location.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm">

              <h2 className="text-xl font-semibold mb-1">
                Pricing & Specifications
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Add pricing and room details
              </p>

              <div className="space-y-4">

                {/* Price + Size */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Price (₹) *
                    </label>

                    <Input
                      type="text"
                      placeholder="e.g., 12000000"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Size (sq ft) *
                    </label>

                    <Input
                      type="text"
                      placeholder="e.g., 1450"
                      value={formData.size || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          size: e.target.value
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>

                </div>

                {/* Bedrooms + Bathrooms - Residential only */}
                {formData.category === "residential" && (
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Bedrooms *
                      </label>

                      <Select
                        value={formData.bedrooms || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            bedrooms: value
                          })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">1 BHK</SelectItem>
                          <SelectItem value="2">2 BHK</SelectItem>
                          <SelectItem value="3">3 BHK</SelectItem>
                          <SelectItem value="4">4 BHK</SelectItem>
                          <SelectItem value="5">5+ BHK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Bathrooms *
                      </label>

                      <Select
                        value={formData.bathrooms || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            bathrooms: value
                          })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                )}

                {/* Plot-specific fields */}
                {formData.category === "plot" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Plot Area (sq yd) *
                      </label>
                      <Input
                        placeholder="e.g., 200"
                        value={formData.plotArea || ""}
                        onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Frontage (ft) *
                      </label>
                      <Input
                        placeholder="e.g., 30"
                        value={formData.frontage || ""}
                        onChange={(e) => setFormData({ ...formData, frontage: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Road Width (ft) *
                      </label>
                      <Input
                        placeholder="e.g., 24"
                        value={formData.roadWidth || ""}
                        onChange={(e) => setFormData({ ...formData, roadWidth: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Dimensions *
                      </label>
                      <Input
                        placeholder="e.g., 30x60"
                        value={formData.dimensions || ""}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Commercial / SCO-specific fields */}
                {(formData.category === "commercial" || formData.category === "sco") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Floor *
                      </label>
                      <Input
                        placeholder="e.g., Ground, 1st"
                        value={formData.floorNumber || ""}
                        onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Washrooms *
                      </label>
                      <Input
                        placeholder="e.g., 2"
                        value={formData.washrooms || ""}
                        onChange={(e) => setFormData({ ...formData, washrooms: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Parking *
                      </label>
                      <Select
                        value={formData.parking || ""}
                        onValueChange={(value) => setFormData({ ...formData, parking: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select parking" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Project + Floor - Residential only (Commercial/SCO collect Floor above) */}
                {formData.category === "residential" && (
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Project Name
                      </label>

                      <Input
                        placeholder="e.g., DLF Phase 5"
                        value={formData.projectName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectName: e.target.value
                          })
                        }
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Floor Number
                      </label>

                      <Input
                        placeholder="e.g., 5"
                        value={formData.floorNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            floorNumber: e.target.value
                          })
                        }
                        className="h-12 rounded-xl"
                      />
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm">

              <h2 className="text-xl font-semibold mb-1">
                Amenities & Features
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Tell buyers what makes it special
              </p>

              <div className="space-y-5">

                {/* Highlights */}
                <div>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Highlights
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Park Facing",
                      "Corner Flat",
                      "Near Metro",
                      "Gated Society"
                    ].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setHighlights(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-sm border ${highlights.includes(item)
                          ? "bg-primary text-white"
                          : "bg-card"
                          }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Facilities
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Gym",
                      "Swimming Pool",
                      "Lift",
                      "Parking",
                      "Power Backup",
                      "Security"
                    ].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setFacilities(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-sm border ${facilities.includes(item)
                          ? "bg-primary text-white"
                          : "bg-card"
                          }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <h2 className="text-xl font-semibold mb-1 pt-14">
                Additional Details
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Tell buyers some other important details about your property
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Balconies
                  </label>
                  <Input
                    placeholder="e.g., 2"
                    value={formData.balconies || ""}
                    onChange={(e) => setFormData({ ...formData, balconies: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Furnishing
                  </label>
                  <Select
                    value={formData.furnishingStatus || ""}
                    onValueChange={(value) => setFormData({ ...formData, furnishingStatus: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select furnishing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                      <SelectItem value="unfurnished">Not Furnishing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Parking
                  </label>
                  <Select
                    value={formData.parking || ""}
                    onValueChange={(value) => setFormData({ ...formData, parking: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select parking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Power Backup
                  </label>
                  <Select
                    value={formData.powerBackup || ""}
                    onValueChange={(value) => setFormData({ ...formData, powerBackup: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Construction Status
                  </label>
                  <Select
                    value={formData.constructionStatus || ""}
                    onValueChange={(value) => setFormData({ ...formData, constructionStatus: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Ready to Move</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Possession
                  </label>
                  <Input
                    placeholder="e.g., Dec 2026"
                    value={formData.possession || ""}
                    onChange={(e) => setFormData({ ...formData, possession: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">

              {/* Media Upload Section */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold mb-1">
                  Media Uploads
                </h2>

                <p className="text-sm text-gray-500 mb-5">
                  Upload property photos, videos and floor plans
                </p>
                <div className="space-y-4">
                  {/* Photos */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Photos
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="photoUpload"
                      style={{ display: "none" }}
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      type="button"
                      disabled={uploading}
                      onClick={() => document.getElementById("photoUpload")?.click()}
                      className="w-full h-12 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:bg-accent/10 text-foreground flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>{uploading ? "Uploading..." : "Upload Photos"}</span>
                    </Button>
                    <div className="flex items-center justify-between mt-3">

                      <p className="text-sm text-muted-foreground">
                        Minimum 6 photos required
                      </p>

                      <p
                        className={`text-sm font-semibold ${photos.length >= MIN_IMAGES
                          ? "text-green-600"
                          : "text-orange-500"
                          }`}
                      >
                        Uploaded: {photos.length}/{MIN_IMAGES}
                        {photos.length >= MIN_IMAGES && " Complete"}
                      </p>

                    </div>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative rounded-xl overflow-hidden group">
                            <img
                              src={photo}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Videos
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      id="videoUpload"
                      style={{ display: "none" }}
                      onChange={handleVideoUpload}
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("videoUpload")?.click()}
                      className="w-full h-12 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:bg-accent/10 text-foreground flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <Video className="w-5 h-5" />
                      <span>Upload Videos</span>
                    </Button>
                    {videos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {videos.map((video, index) => (
                          <div key={index} className="relative">
                            <video src={video} className="w-full h-32 rounded-xl object-cover" controls />
                            <button
                              onClick={() => removeVideo(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floor Plans */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Floor Plans
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      multiple
                      id="floorUpload"
                      style={{ display: "none" }}
                      onChange={handleFloorPlanUpload}
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("floorUpload")?.click()}
                      className="w-full h-12 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:bg-accent/10 text-foreground flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Upload Floor Plans</span>
                    </Button>
                    {floorPlans.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {floorPlans.map((plan, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-card rounded-xl border">
                            <span className="text-sm truncate">{plan}</span>
                            <button onClick={() => removeFloorPlan(index)}>
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>






              {/* Description */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">

                <label className="text-sm text-muted-foreground mb-2 block">
                  Description *
                </label>

                <Textarea
                  placeholder="Describe your property, amenities, nearby facilities, etc."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })
                  }
                  className="rounded-2xl min-h-[160px]"
                />
              </div>

              {/* Contact */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">

                <h2 className="text-xl font-semibold mb-5">
                  Contact Information
                </h2>

                <div className="space-y-4">

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Name *
                    </label>

                    <Input
                      placeholder="Enter your name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Mobile Number *
                    </label>

                    <Input
                      placeholder="Mobile number"
                      value={formData.mobile || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile: e.target.value
                        })
                      }
                      className="h-12 rounded-xl bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Email
                    </label>

                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className=" px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ">

        <div className="flex gap-3">

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="
                flex-1
                h-12
                rounded-xl
                border
                border-gray-200
                bg-white
                font-medium
              "
            >
              Back
            </button>
          )}

          {step < totalSteps ? (

            <GradientButton
              onClick={() => {

                if (
                  step === 1 &&
                  (
                    !formData.title ||
                    !formData.category ||
                    !formData.propertyType ||
                    !formData.city ||
                    !formData.ownerType ||
                    (formData.ownerType === "builder" && !formData.builder)
                  )
                ) {
                  alert("Please fill required fields");
                  return;
                }

                if (
                  step === 2 &&
                  (
                    !formData.price ||
                    !formData.size ||
                    !categoryFieldsValid()
                  )
                ) {
                  alert("Please fill required fields");
                  return;
                }

                setStep(step + 1);
              }}
              className="flex-1 h-12"
            >
              Continue
            </GradientButton>

          ) : (

            <GradientButton
              onClick={handleSubmit}
              className="flex-1 h-12"
              disabled={!isFormValid || photos.length < MIN_IMAGES}
            >
              Submit Property
            </GradientButton>

          )}

        </div>
      </div>
    </div>
  );
}