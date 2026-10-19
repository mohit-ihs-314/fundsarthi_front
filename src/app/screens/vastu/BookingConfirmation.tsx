import { useNavigate, useLocation } from "react-router";
import { CheckCircle2, User, MapPin, Home } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { expert, formData } = location.state || {};
  const bookingId = location.state?.bookingId || "N/A";

  return (
    <div className="min-h-screen overflow-y-auto px-6 py-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold mb-3">
            Thank You for Your Request!
          </h1>

          <p className="text-muted-foreground leading-relaxed">
            Your consultation request has been successfully submitted.
            Our Vastu Consultant will review your preferred date and
            time and confirm the appointment shortly.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Booking ID</span>
            <span className="text-primary">{bookingId}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expert</p>
                <p>{expert?.full_name || "Dr. Rajesh Sharma"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p>{formData?.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p>{formData?.propertyType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 mb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You will receive a booking confirmation notification once
            your consultation slot has been approved by the consultant.

            <br />
            <br />

            Thank you for choosing <strong>FundSarthi</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/my-consultations")}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            View My Consultations
          </Button>
          <Button
            onClick={() => navigate("/home")}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
