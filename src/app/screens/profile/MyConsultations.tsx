import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  Users,
  Video,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MyConsultations() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    const mobile = localStorage.getItem("userMobile");

    if (!mobile) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch(
        `https://api.fundsarthi.in/api/my-consultations?mobile=${mobile}`
      );

      if (!res.ok) {
        throw new Error("Unable to fetch consultations");
      }

      const data = await res.json();

      if (data.status === "success") {
        setBookings(Array.isArray(data.data) ? data.data : []);
      } else {
        setBookings([]);
        setError(data.message || "Unable to load consultations.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your consultations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusColor = (status: string) => {
    const normalizedStatus = String(status || "").toLowerCase();

    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-600",
      confirmed: "bg-blue-100 text-blue-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
    };

    return colors[normalizedStatus] || "bg-gray-100 text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "completed") {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    if (normalizedStatus === "cancelled") {
      return <CircleAlert className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  };

  const getConsultationIcon = (type: string) => {
    const normalizedType = String(type || "").toLowerCase();

    if (
      normalizedType.includes("video") ||
      normalizedType.includes("online")
    ) {
      return <Video className="w-5 h-5" />;
    }

    if (normalizedType.includes("phone") || normalizedType.includes("call")) {
      return <Phone className="w-5 h-5" />;
    }

    return <MessageCircle className="w-5 h-5" />;
  };

  const getInitials = (name: string) => {
    if (!name) return "C";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase())
      .join("");
  };

  const totalConsultations = bookings.length;

  const upcomingConsultations = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();

    return status === "pending" || status === "confirmed";
  }).length;

  const completedConsultations = bookings.filter((booking) => {
    return String(booking.status || "").toLowerCase() === "completed";
  }).length;

  return (
    <div className="my-consultations-page h-[100dvh] w-full max-w-full min-w-0 overflow-y-auto overflow-x-clip overscroll-contain bg-background" style={{ overflowAnchor: "none", WebkitOverflowScrolling: "touch" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 w-full min-w-0 bg-card/95 border-b border-border px-3 py-3 backdrop-blur-md sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">My Consultations</h1>
            <p className="truncate text-[11px] leading-4 text-muted-foreground sm:text-xs">
              Manage your consultation appointments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Refresh consultations"
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <main className="w-full min-w-0 px-3 py-5 pb-10 sm:px-5 sm:py-6 sm:pb-12 lg:px-6">
        {/* Intro */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg font-semibold mb-1 sm:text-xl">
            Your Consultations
          </h2>

          <p className="max-w-2xl text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-relaxed">
            View your upcoming and previous consultations, check appointment
            details, and track the status of your consultation.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 sm:gap-3 sm:mb-7">
          {/* Total */}
          <div className="min-w-0 bg-card border border-border rounded-2xl p-3 sm:p-4">
            <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 sm:mb-3 sm:h-9 sm:w-9">
              <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </div>

            <p className="text-xl font-bold sm:text-2xl">
              {loading ? "-" : totalConsultations}
            </p>

            <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">
              Total
            </p>
          </div>

          {/* Upcoming */}
          <div className="min-w-0 bg-card border border-border rounded-2xl p-3 sm:p-4">
            <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 sm:mb-3 sm:h-9 sm:w-9">
              <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            </div>

            <p className="text-xl font-bold sm:text-2xl">
              {loading ? "-" : upcomingConsultations}
            </p>

            <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">
              Upcoming
            </p>
          </div>

          {/* Completed */}
          <div className="min-w-0 bg-card border border-border rounded-2xl p-3 sm:p-4">
            <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 sm:mb-3 sm:h-9 sm:w-9">
              <CheckCircle2 className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
            </div>

            <p className="text-xl font-bold sm:text-2xl">
              {loading ? "-" : completedConsultations}
            </p>

            <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">
              Completed
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-base">
              Consultation History
            </h3>

            {!loading && bookings.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {bookings.length} consultation
                {bookings.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="w-full min-w-0 bg-card rounded-2xl p-4 border border-border animate-pulse sm:p-5"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-muted" />

                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>

                  <div>
                    <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="w-full min-w-0 bg-card border border-red-200 rounded-2xl p-5 text-center sm:p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <CircleAlert className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="font-semibold mb-2">
              Something went wrong
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchBookings()}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="w-full min-w-0 bg-card border border-border rounded-2xl p-5 text-center sm:p-7">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-8 h-8 text-primary" />
            </div>

            <h3 className="font-semibold text-lg mb-2">
              No Consultations Yet
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              You don't have any consultations booked yet. Once you schedule
              a consultation, your appointment details and status will appear
              here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/vastu")}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium"
            >
              Explore Consultants
            </button>
          </div>
        )}

        {/* Consultation List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4 pb-6">
            {bookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() =>
                  navigate(`/track-consultation/${booking.id}`)
                }
                className="w-full min-w-0 bg-card rounded-2xl p-4 border border-border text-left hover:border-primary/40 transition-all active:scale-[0.99] sm:p-5"
              >
                {/* Consultant Header */}
                <div className="mb-4 flex min-w-0 items-center justify-between gap-2 sm:mb-5 sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary sm:h-12 sm:w-12">
                      {getInitials(booking.consultant_name)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold sm:text-base">
                        {booking.consultant_name || "Consultant"}
                      </h3>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                        {getConsultationIcon(
                          booking.consultation_type
                        )}

                        <span className="truncate">
                          {booking.consultation_type ||
                            "Consultation"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3">
                  {/* Date */}
                  <div className="min-w-0 rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />

                      <span className="text-xs">
                        Date
                      </span>
                    </div>

                    <p className="break-words text-sm font-medium">
                      {booking.date || "Not available"}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="min-w-0 rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />

                      <span className="text-xs">
                        Time
                      </span>
                    </div>

                    <p className="break-words text-sm font-medium">
                      {booking.time || "Not available"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />

                    <span className="truncate text-xs text-muted-foreground sm:text-sm">
                      Consultation Status
                    </span>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 sm:px-3 sm:text-xs ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusIcon(booking.status)}

                    {booking.status || "Pending"}
                  </span>
                </div>

                {/* Action */}
                <div className="mt-4 flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-primary">
                  <span className="min-w-0 break-words">
                    View consultation details
                  </span>

                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

