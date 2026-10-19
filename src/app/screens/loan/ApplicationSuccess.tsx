import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";



export default function ApplicationSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    // Get the last submitted application ID
    const applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    if (applications.length > 0) {
      const lastApplication = applications[applications.length - 1];
      setApplicationId(lastApplication.id);
    }
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-background">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl mb-2">Application Submitted!</h1>
        <p className="text-muted-foreground mb-8">
          Your loan application has been successfully submitted
        </p>

        <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Application ID</p>
          <p className="text-2xl text-primary mb-4">{id}</p>
          <p className="text-sm text-muted-foreground">
            You will receive updates on your registered mobile number and email
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/track-application/${id}`)}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            Track Application
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