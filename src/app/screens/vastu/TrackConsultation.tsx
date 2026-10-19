import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function TrackConsultation() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {

    const fetchBooking = async () => {

      try {

        const res = await fetch(
          `https://api.fundsarthi.in/api/track-consultation/${id}`
        );

        const data = await res.json();

        if (data.status === "success") {
          setBooking(data.data);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchBooking();

  }, [id]);

  const getStatusColor = (status: string) => {

    const colors: Record<string, string> = {
      Pending: "bg-orange-100 text-orange-600",
      Confirmed: "bg-blue-100 text-blue-600",
      Completed: "bg-green-100 text-green-600",
      Cancelled: "bg-red-100 text-red-600",
    };

    return colors[status] || "bg-gray-100 text-gray-600";
  };

  if (!booking) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  const firstPendingIndex =
    booking.steps?.findIndex((s: any) => !s.is_done);

  const stages =
    booking.steps?.map((step: any, index: number) => {

      let status = "pending";

      if (step.is_done) {
        status = "completed";
      } else if (index === firstPendingIndex) {
        status = "active";
      }

      return {
        title: step.step_name,
        status,
      };
    }) || [];

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">

        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="ml-4">
          Track Consultation
        </h1>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Booking Card */}
        <div className="bg-card rounded-2xl p-5 border border-border mb-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Booking ID
              </p>

              <p className="text-lg">
                {booking.id}
              </p>
            </div>

            <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
              {booking.status}
            </div>

          </div>

          <div className="space-y-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Consultant
                </p>

                <p>{booking.consultant_name}</p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Consultation Date
                </p>

                <p>{booking.date}</p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Consultation Time
                </p>

                <p>{booking.time}</p>
              </div>

            </div>

          </div>

        </div>

        {/* Timeline */}
        <h3 className="mb-4">
          Consultation Progress
        </h3>

        <div className="relative">

          {stages.map((stage: any, index: number) => (

            <div
              key={index}
              className="flex gap-4 mb-6 relative"
            >

              <div className="flex flex-col items-center">

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${stage.status === "completed"
                      ? "bg-primary text-white"
                      : stage.status === "active"
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                >

                  {stage.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}

                </div>

                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 h-12
                    ${stage.status === "completed"
                        ? "bg-primary"
                        : "bg-muted"
                      }`}
                  />
                )}

              </div>

              <div className="flex-1 pb-4">

                <p className="mb-1">
                  {stage.title}
                </p>

                <p
                  className={`text-sm
                  ${stage.status === "completed"
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

      </div>

    </div>
  );
}