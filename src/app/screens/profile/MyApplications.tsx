import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(`https://api.fundsarthi.in/api/my-loans?mobile=${mobile}`);
        const data = await res.json();

        if (data.status === "success") {
          setApplications(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New": "bg-blue-100 text-blue-600",
      "In Process": "bg-orange-100 text-orange-600",
      "Approved": "bg-green-100 text-green-600",
      "Rejected": "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">My Applications</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-muted-foreground mb-6">
          Track all your loan applications in one place
        </p>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              You haven't submitted any loan applications yet
            </p>
            <button
              onClick={() => navigate("/loans")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Apply for Loan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/track-application/${app.id}`)}
                className="w-full bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-1">{app.type}</h3>
                      <p className="text-sm text-muted-foreground">{app.id}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Loan Amount</p>
                    <p className="text-lg">₹ {app.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground mb-1">Applied On</p>
                    <p>{app.date}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}