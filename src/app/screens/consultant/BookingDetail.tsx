import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, User, Phone, Calendar, Clock, Home } from "lucide-react";
import { Button } from "../../components/ui/button";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  consultationType: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBooking = async () => {
    const consultantId = localStorage.getItem("consultantId");
    if (!consultantId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.fundsarthi.in/api/my-bookings?consultant_id=${consultantId}`
      );
      const data = await res.json();

      if (data.status === "success") {
        const match = (data.data || []).find((b: Booking) => String(b.id) === String(id));
        setBooking(match || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!booking) return;

    const confirmMessage =
      status === "Completed"
        ? "Mark this consultation as completed? This cannot be undone."
        : "Accept this booking?";

    if (!window.confirm(confirmMessage)) return;

    setUpdating(true);
    try {
      await fetch("https://api.fundsarthi.in/api/update-booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: booking.id, status }),
      });
      await fetchBooking();
    } catch (err) {
      console.error(err);
      alert("Could not update booking status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4">Booking Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm">
            {booking.status}
          </div>
          <p className="text-sm text-muted-foreground">Booking ID: #{booking.id}</p>
        </div>

        {/* Client Information */}
        <div className="bg-card rounded-2xl p-5 border border-border mb-4">
          <h3 className="mb-4">Client Information</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{booking.customerName || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-primary">{booking.customerPhone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-card rounded-2xl p-5 border border-border mb-4">
          <h3 className="mb-4">Appointment Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{booking.bookingDate || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p>{booking.bookingTime || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consultation Type</p>
                <p>{booking.consultationType || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {booking.status === "Pending" && (
            <Button
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
              disabled={updating}
              onClick={() => updateStatus("Confirmed")}
            >
              Accept Booking
            </Button>
          )}

          {(booking.status === "Pending" || booking.status === "Confirmed") && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => navigate("/my-bookings")}
            >
              Reschedule
            </Button>
          )}

          {booking.status === "Confirmed" && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-primary border-primary hover:bg-primary/5"
              disabled={updating}
              onClick={() => updateStatus("Completed")}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
