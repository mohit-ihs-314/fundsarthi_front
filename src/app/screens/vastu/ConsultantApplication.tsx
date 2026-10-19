import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { GradientButton } from "../../components/ui/gradient-button";

export default function ConsultantApplication() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    city: "",
    address: "",
    expertise: [] as string[],
    experience: "",
    consultation_fee: "",
    languages: "",
    bio: "",
    phone: "",
    photo: null as File | null,

    // ✅ NEW
    certificate: null as File | null,
    govt_id: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Auto-fill phone from localStorage
    const savedMobile = localStorage.getItem('userMobile');
    if (savedMobile) {
      setFormData(prev => ({ ...prev, phone: savedMobile }));
    }
  }, []);

  const expertiseOptions = ["Residential", "Commercial", "Industrial", "Other"];

  const toggleExpertise = (option: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(option)
        ? prev.expertise.filter(e => e !== option)
        : [...prev.expertise, option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoUrl = "";
      let certificateUrl = "";
      let govtIdUrl = "";

      // 🔁 SAFE upload function
      const uploadFile = async (file: File) => {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("https://api.fundsarthi.in/api/upload-image", {
          method: "POST",
          body: fd,
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Upload API not returning JSON:", text);
          throw new Error("Upload failed (server error)");
        }

        if (!res.ok || data.status !== "success") {
          throw new Error(data.message || "Upload failed");
        }

        return data.url;
      };

      // ✅ Upload Photo (optional)
      if (formData.photo) {
        photoUrl = await uploadFile(formData.photo);
      }

      // ✅ Upload Certificate (required)
      if (!formData.certificate) {
        alert("Certificate is required");
        return;
      }
      certificateUrl = await uploadFile(formData.certificate);

      // ✅ Upload Govt ID (required)
      if (!formData.govt_id) {
        alert("Government ID is required");
        return;
      }
      govtIdUrl = await uploadFile(formData.govt_id);

      // ✅ FIX: convert experience to number
      const payload = {
        ...formData,
        experience: Number(formData.experience),
        consultation_fee: Number(formData.consultation_fee),
        photo: photoUrl,
        certificate: certificateUrl,
        govt_id: govtIdUrl,
      };

      // 📤 Submit
      const res = await fetch("https://api.fundsarthi.in/api/apply-consultant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Apply API not returning JSON:", text);
        alert("Server error. Please try again.");
        return;
      }

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Submission failed");
      }

      setSubmitted(true);

    } catch (err: any) {
      console.error("🔥 ERROR:", err);
      alert(err.message || "Something went wrong. Try again.");
    }
  };

  const isFormValid = () => {
    return formData.fullName &&
      formData.city &&
      formData.expertise.length > 0 &&
      formData.experience &&
      !isNaN(Number(formData.experience)) &&   // 🔥 FIX
      formData.languages &&
      formData.bio &&
      formData.certificate &&
      formData.govt_id &&
      formData.address;
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-2xl text-center mb-3">Application Approved!</h1>
          <p className="text-muted-foreground text-center mb-2 max-w-sm">
            Congratulations! Your application has been approved.
          </p>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            You can now manage bookings from your profile. The "Manage Vastu Bookings" option is now available.
          </p>

          <div className="w-full max-w-sm space-y-3">
            <GradientButton
              onClick={() => navigate("/profile")}
              className="w-full"
            >
              View Profile
            </GradientButton>
            <button
              onClick={() => navigate("/vastu")}
              className="w-full h-12 rounded-xl border border-border hover:shadow-md transition-shadow"
            >
              Back to Vastu Experts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/vastu")}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1>Apply to Become a Vastu Consultant</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-12">
          Fill in your details to join our expert network
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <Input
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Address *
            </label>

            <textarea
              placeholder="Enter complete address"
              value={(formData as any).address || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                } as any)
              }
              className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background resize-none"
              required
            />
          </div>

          {/* Areas of Expertise */}
          <div>
            <label className="block text-sm font-medium mb-2">Areas of Expertise *</label>
            <div className="grid grid-cols-2 gap-3">
              {expertiseOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleExpertise(option)}
                  className={`p-3 rounded-xl border-2 transition-all ${formData.expertise.includes(option)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${formData.expertise.includes(option)
                      ? "border-primary bg-primary"
                      : "border-border"
                      }`}>
                      {formData.expertise.includes(option) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium mb-2">Years of Experience *</label>
            <Input
              type="number"
              placeholder="e.g., 10"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="h-12 rounded-xl"
              required
              min="0"
            />
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Consultation Fee (₹) *
            </label>

            <Input
              type="number"
              placeholder="e.g. 500"
              value={formData.consultation_fee}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consultation_fee: e.target.value,
                })
              }
              className="h-12 rounded-xl"
              required
            />
          </div>

          {/* Languages Spoken */}
          <div>
            <label className="block text-sm font-medium mb-2">Languages Spoken *</label>
            <Input
              type="text"
              placeholder="e.g., Hindi, English, Gujarati"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Short Bio or Description *</label>
            <textarea
              placeholder="Tell us about your experience and approach to Vastu consultation..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-background resize-none"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone}
              className="h-12 rounded-xl bg-muted"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">Auto-filled from your login</p>
          </div>

          {/* Upload Photo */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Profile Photo (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload or drag and drop
              </p>

              <p className="text-xs text-muted-foreground">
                (JPG, PNG allowed • Max 10MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, photo: e.target.files[0] });
                  }
                }}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-4 py-2 bg-card border border-border rounded-lg text-sm cursor-pointer hover:shadow-md"
              >
                Choose File
              </label>
              {formData.photo && (
                <p className="text-xs text-primary mt-2">{formData.photo.name}</p>
              )}
            </div>
          </div>

          {/* Upload Certificate */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Certificate *</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload or drag and drop
              </p>

              <p className="text-xs text-muted-foreground">
                (JPG, PNG allowed • Max 10MB)
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];

                    // ✅ allow only images
                    if (!file.type.startsWith("image/")) {
                      alert("Only image files are allowed for certificate (JPG, PNG)");
                      return;
                    }

                    setFormData({ ...formData, certificate: file });
                  }
                }}
                className="hidden"
                id="certificate-upload"
              />

              <label
                htmlFor="certificate-upload"
                className="inline-block px-4 py-2 bg-card border border-border rounded-lg text-sm cursor-pointer hover:shadow-md"
              >
                Choose File
              </label>

              {formData.certificate && (
                <p className="text-xs text-primary mt-2">
                  {formData.certificate.name}
                </p>
              )}
            </div>
          </div>

          {/* Upload Govt ID */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Govt ID *</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload or drag and drop
              </p>

              <p className="text-xs text-muted-foreground">
                (JPG, PNG allowed • Max 10MB)
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];

                    if (!file.type.startsWith("image/")) {
                      alert("Only image files are allowed for Government ID");
                      return;
                    }

                    setFormData({ ...formData, govt_id: file });
                  }
                }}
                className="hidden"
                id="govt-upload"
              />

              <label
                htmlFor="govt-upload"
                className="inline-block px-4 py-2 bg-card border border-border rounded-lg text-sm cursor-pointer hover:shadow-md"
              >
                Choose File
              </label>

              {formData.govt_id && (
                <p className="text-xs text-primary mt-2">
                  {formData.govt_id.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <GradientButton
            type="submit"
            className="w-full"
            disabled={!isFormValid()}
          >
            Submit Application
          </GradientButton>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields
          </p>
        </form>
      </div>
    </div>
  );
}