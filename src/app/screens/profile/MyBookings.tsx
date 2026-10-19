import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, X } from "lucide-react";
import { GradientButton } from "../../components/ui/gradient-button";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  consultationType: "Residential" | "Commercial" | "Industrial";
  bookingDate: string;
  bookingTime: string;
  status: "Pending" | "Confirmed" | "Completed";
}

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [consultantId, setConsultantId] = useState<string | null>(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ label: string; value: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const isPastSlot = (slotTime: string) => {
    if (selectedDate !== today) return false;
    const now = new Date();
    const [hours, minutes, seconds] = slotTime.split(":").map(Number);
    const slotDate = new Date();
    slotDate.setHours(hours, minutes, seconds || 0, 0);
    return slotDate <= now;
  };

  // Fetch this consultant's real available slots for the chosen date
  useEffect(() => {
    if (!showRescheduleModal || !selectedDate || !consultantId) {
      setAvailableSlots([]);
      return;
    }

    fetch(
      `https://api.fundsarthi.in/api/consultant-slots?consultant_id=${consultantId}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setAvailableSlots(data.data.filter((slot: any) => !isPastSlot(slot.value)));
        } else {
          setAvailableSlots([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableSlots([]);
      });
  }, [showRescheduleModal, selectedDate, consultantId]);

  // ✅ STEP 1: GET CONSULTANT ID FROM MOBILE
  useEffect(() => {
    const fetchConsultantId = async () => {
      const mobile = localStorage.getItem("userMobile");
      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/get-consultant-id?mobile=${mobile}`
        );

        const data = await res.json();

        if (data.status === "success") {
          setConsultantId(data.consultant_id);
          localStorage.setItem("consultantId", data.consultant_id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchConsultantId();
  }, []);

  // ✅ STEP 2: FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      if (!consultantId) return;

      setLoading(true);

      const res = await fetch(
        `https://api.fundsarthi.in/api/my-bookings?consultant_id=${consultantId}`
      );

      const data = await res.json();

      if (data.status === "success") {
        setBookings(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [consultantId]);

  // ✅ APPROVE
  const handleApproveBooking = async (bookingId: string) => {
    if (!window.confirm("Approve this booking?")) return;

    await fetch("https://api.fundsarthi.in/api/update-booking-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ booking_id: bookingId, status: "confirmed" }),
    });

    fetchBookings();
  };

  // ✅ COMPLETE
  const handleMarkCompleted = async (bookingId: string) => {
    if (!window.confirm("Mark this consultation as completed? This cannot be undone.")) return;

    await fetch("https://api.fundsarthi.in/api/update-booking-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ booking_id: bookingId, status: "completed" }),
    });

    fetchBookings();
  };

  // ✅ RESCHEDULE OPEN
  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(booking.bookingDate || "");
    setSelectedTime(booking.bookingTime || "");
    setShowRescheduleModal(true);
  };

  // ✅ RESCHEDULE CONFIRM
  const handleConfirmReschedule = async () => {
    if (!selectedBooking) return;

    if (!selectedDate || selectedDate < today) {
      alert("Please select a valid upcoming date");
      return;
    }

    if (!selectedTime) {
      alert("Please select an available time slot");
      return;
    }

    await fetch("https://api.fundsarthi.in/api/reschedule-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: selectedBooking.id,
        date: selectedDate,
        time: selectedTime,
      }),
    });

    setShowRescheduleModal(false);
    fetchBookings();
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-600";
      case "Confirmed":
        return "bg-primary/10 text-primary";
      case "Completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderBookingCard = (booking: Booking) => {
    return (
      <div key={booking.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">{booking.customerName}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.consultationType} Vastu
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(booking.status)}`}>
            {booking.status}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {booking.bookingDate
                ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{booking.bookingTime || "-"}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border mb-4">
          <span className="text-xs text-muted-foreground">
            Booking ID: {booking.id}
          </span>
        </div>

        <div className="flex gap-2">
          {booking.status === "Pending" && (
            <>
              <button
                onClick={() => handleApproveBooking(booking.id)}
                className="flex-1 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Booking
              </button>
              <button
                onClick={() => handleReschedule(booking)}
                className="flex-1 h-10 border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                Reschedule
              </button>
            </>
          )}

          {booking.status === "Confirmed" && (
            <>
              <button
                onClick={() => handleReschedule(booking)}
                className="flex-1 h-10 border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                Reschedule
              </button>
              <button
                onClick={() => handleMarkCompleted(booking.id)}
                className="flex-1 h-10 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Completed
              </button>
            </>
          )}

          {booking.status === "Completed" && (
            <button className="w-full h-10 bg-muted rounded-xl text-sm">
              View Details
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1>Manage Vastu Consultations</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-12">
          Manage and track all your consultation bookings
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading bookings...</p>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map(renderBookingCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        )}
      </div>

      {/* SAME MODAL UI - NO CHANGE */}
      {showRescheduleModal && selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowRescheduleModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50">
            <div className="px-6 py-6">
              <div className="w-12 h-1 bg-border mx-auto mb-6" />

              <div className="flex justify-between mb-6">
                <h2>Reschedule Booking</h2>
                <button onClick={() => setShowRescheduleModal(false)}>
                  <X />
                </button>
              </div>

              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full mb-4"
              />

              <div className="grid grid-cols-4 gap-2 mb-6">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={selectedTime === slot.value ? "bg-primary text-white" : "bg-muted"}
                    >
                      {slot.label}
                    </button>
                  ))
                ) : (
                  <p className="col-span-4 text-sm text-muted-foreground text-center">
                    {selectedDate ? "No slots available for this date" : "Select a date to see available slots"}
                  </p>
                )}
              </div>

              <GradientButton onClick={handleConfirmReschedule} className="w-full">
                Confirm Reschedule
              </GradientButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}