import { useNavigate } from "react-router";
import { Calendar, Clock, Settings, LogOut, ChevronRight } from "lucide-react";

export default function ConsultantDashboard() {
  const navigate = useNavigate();

  const todayBookings = [
    {
      id: 1,
      clientName: "Amit Verma",
      time: "10:00 AM",
      propertyType: "Residential",
      status: "Confirmed",
    },
    {
      id: 2,
      clientName: "Priya Desai",
      time: "02:00 PM",
      propertyType: "Commercial",
      status: "Confirmed",
    },
  ];

  const upcomingBookings = [
    {
      id: 3,
      clientName: "Rahul Mehta",
      date: "28 Feb",
      time: "11:00 AM",
      propertyType: "Residential",
      status: "Pending",
    },
    {
      id: 4,
      clientName: "Sneha Kapoor",
      date: "1 Mar",
      time: "03:00 PM",
      propertyType: "Industrial",
      status: "Confirmed",
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "Confirmed") return "bg-green-100 text-green-600";
    if (status === "Pending") return "bg-orange-100 text-orange-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-6 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Welcome back,</p>
            <h1 className="text-2xl">Dr. Rajesh Sharma</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">Today's Bookings</p>
            <p className="text-3xl">{todayBookings.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">This Week</p>
            <p className="text-3xl">{todayBookings.length + upcomingBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("/consultant/slots")}
            className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm">Manage Slots</p>
          </button>

          <button className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm">Settings</p>
          </button>
        </div>

        {/* Today's Bookings */}
        <div className="mb-6">
          <h3 className="mb-4">Today's Bookings</h3>
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => navigate(`/consultant/booking/${booking.id}`)}
                className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4>{booking.clientName}</h4>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.time}</span>
                    </div>
                    <span>{booking.propertyType}</span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-6">
          <h3 className="mb-4">Upcoming Bookings</h3>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => navigate(`/consultant/booking/${booking.id}`)}
                className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4>{booking.clientName}</h4>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground text-left">
                  {booking.propertyType}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
