import { useState } from "react";
import { useNavigate } from "react-router";
import { GradientButton } from "../../components/ui/gradient-button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ArrowLeft, Users } from "lucide-react";

export default function BecomePartner() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    serviceType: "",
    city: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch("https://api.fundsarthi.in/api/become-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Application submitted successfully 🚀");
        navigate("/home");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">Become a Partner</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl mb-2">Join Our Partner Network</h2>
          <p className="text-sm opacity-90">
            Grow your business by partnering with Fundsarthi. Connect with
            thousands of customers looking for your services.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Full Name *
            </label>
            <Input
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Company Name *
            </label>
            <Input
              placeholder="Enter company name"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Service Type *
            </label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData({ ...formData, serviceType: value })
              }
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loan-dsa">Loan DSA</SelectItem>
                <SelectItem value="real-estate">Real Estate Agent</SelectItem>
                <SelectItem value="vastu">Vastu Consultant</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              City *
            </label>
            <Select
              value={formData.city}
              onValueChange={(value) =>
                setFormData({ ...formData, city: value })
              }
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="new-delhi">New Delhi</SelectItem>
                <SelectItem value="gurgaon">Gurgaon</SelectItem>
                <SelectItem value="noida">Noida</SelectItem>
                <SelectItem value="greater-noida">Greater Noida</SelectItem>
                <SelectItem value="ghaziabad">Ghaziabad</SelectItem>
                <SelectItem value="faridabad">Faridabad</SelectItem>
                <SelectItem value="sohna">Sohna</SelectItem>
                <SelectItem value="manesar">Manesar</SelectItem>
                <SelectItem value="farukhnagar">Farukhnagar</SelectItem>
                <SelectItem value="bahadurgarh">Bahadurgarh</SelectItem>
                <SelectItem value="sonipat">Sonipat</SelectItem>
                <SelectItem value="palwal">Palwal</SelectItem>
                <SelectItem value="rewari">Rewari</SelectItem>
                <SelectItem value="bhiwadi">Bhiwadi</SelectItem>
                <SelectItem value="alwar">Alwar</SelectItem>
                <SelectItem value="meerut">Meerut</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-card rounded-2xl p-5 border border-border">
          <h3 className="mb-3">Partner Benefits</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Access to thousands of verified leads</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Digital tools to manage your business</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Marketing and brand support</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <span>Training and certification programs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <GradientButton
          onClick={handleSubmit}
          className="w-full"
          disabled={
            !formData.name ||
            !formData.company ||
            !formData.serviceType ||
            !formData.city ||
            !formData.phone ||
            !formData.email
          }
        >
          Submit Application
        </GradientButton>
      </div>
    </div>
  );
}
