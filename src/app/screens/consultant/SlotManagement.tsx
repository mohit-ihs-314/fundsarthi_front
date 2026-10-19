import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

export default function SlotManagement() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Mock calendar data
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 1, i + 1); // February 2026
    return {
      date: date.getDate(),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: date.toISOString().split("T")[0],
      hasSlots: Math.random() > 0.3,
    };
  });

  const timeSlots = [
    { time: "09:00 AM", enabled: true, booked: false },
    { time: "10:00 AM", enabled: true, booked: true },
    { time: "11:00 AM", enabled: false, booked: false },
    { time: "12:00 PM", enabled: true, booked: false },
    { time: "02:00 PM", enabled: true, booked: false },
    { time: "03:00 PM", enabled: true, booked: true },
    { time: "04:00 PM", enabled: false, booked: false },
    { time: "05:00 PM", enabled: true, booked: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4">Manage Slots</h1>
        </div>
        <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Calendar Grid */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3>February 2026</h3>
            <button className="text-sm text-primary hover:underline">Block Date</button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dates.slice(0, 28).map((dateObj, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(dateObj.fullDate)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                  selectedDate === dateObj.fullDate
                    ? "bg-primary text-white"
                    : dateObj.hasSlots
                    ? "bg-card border-2 border-primary/20 hover:border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="text-xs mb-1">{dateObj.day}</div>
                <div>{dateObj.date}</div>
                {dateObj.hasSlots && selectedDate !== dateObj.fullDate && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Time Slots</h3>
              <button className="text-sm text-primary hover:underline">Add Slot</button>
            </div>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    slot.booked
                      ? "bg-green-50 border-green-200"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">{slot.time}</div>
                    {slot.booked && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                        Booked
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {!slot.booked && (
                      <>
                        <Switch checked={slot.enabled} />
                        <button className="text-muted-foreground hover:text-destructive">
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 mt-6">
              Save Changes
            </Button>
          </div>
        )}

        {!selectedDate && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <p>Select a date to view and manage time slots</p>
          </div>
        )}
      </div>
    </div>
  );
}
