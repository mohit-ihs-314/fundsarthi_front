import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";

export default function TrackApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`https://api.fundsarthi.in/api/track-loan/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          setApplication(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplication();
  }, [id]);



  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New": "bg-blue-100 text-blue-600",
      "In Process": "bg-orange-100 text-orange-600",
      "Approved": "bg-green-100 text-green-600",
      "Disbursed": "bg-emerald-100 text-emerald-700",
      "Rejected": "bg-red-100 text-red-600",
    };

    return colors[status] || "bg-gray-100 text-gray-600";
  };

  if (!application) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const firstPendingIndex =
    application.steps?.findIndex((s: any) => !s.is_done);

  const stages =
    application.steps?.map((step: any, index: number) => {

      let status = "pending";

      if (step.is_done) {
        status = "completed";
      } else if (index === firstPendingIndex) {
        status = "active";
      }

      return {
        title: step.step_name,
        status,
        date: step.is_done ? "Completed" : "Pending",
      };
    }) || [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">Track Application</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Application ID Card */}
        <div className="bg-card rounded-2xl p-5 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Application ID</p>
              <p className="text-lg">{id}</p>
            </div>
            <div className={`px-3 py-1 ${getStatusColor(application.status)} rounded-full text-sm`}>
              {application.status}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Loan Amount</p>
              <p>₹ {application.amount}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground mb-1">Loan Type</p>
              <p>{application.type}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <h3 className="mb-4">Application Status</h3>
        <div className="relative">
          {stages.map((stage, index) => (
            <div key={index} className="flex gap-4 mb-6 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.status === "completed"
                    ? "bg-primary text-white"
                    : stage.status === "active"
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {stage.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : stage.status === "active" ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${stage.status === "completed" ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="mb-1">{stage.title}</p>
                <p
                  className={`text-sm ${stage.status === "completed"
                    ? "text-green-600"
                    : stage.status === "active"
                      ? "text-orange-500"
                      : "text-muted-foreground"
                    }`}
                >
                  {stage.status === "completed"
                    ? "Completed"
                    : stage.status === "active"
                      ? "In Progress"
                      : "Pending"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Documents */}
        {/* <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 mb-6">
          <h3 className="mb-2">Required Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload the following documents to expedite your application
          </p>
          <div className="space-y-2 mb-4">
            {["Aadhaar Card", "PAN Card", "Income Proof", "Bank Statement"].map((doc) => (
              <div key={doc} className="flex items-center justify-between py-2">
                <span className="text-sm">{doc}</span>
                <span className="text-xs text-muted-foreground">Not Uploaded</span>
              </div>
            ))}
          </div>
          <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90">
            Upload Documents
          </Button>
        </div> */}
      </div>
    </div>
  );
}