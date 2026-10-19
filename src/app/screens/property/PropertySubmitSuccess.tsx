import { useNavigate, useLocation, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { CheckCircle, Home, FileText } from "lucide-react";

export default function PropertySubmitSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const refId = location.state?.refId || "PROP00000000";

  const { id } = useParams();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h1 className="mb-3">Property Submitted Successfully!</h1>
            <p className="text-muted-foreground">
              Your property has been submitted successfully. Our team will review and verify it before publishing.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Reference ID</p>
              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <p className="text-2xl text-primary tracking-wider">{ id }</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Save this reference ID for future tracking
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm mb-1">What's Next?</p>
                <p className="text-xs text-muted-foreground">
                  Our team will verify your property details within 24-48 hours. You'll receive a notification once your property is live.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/property")}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Browse Properties</span>
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
    </div>
  );
}
