import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Plus,
  Trash2,
} from "lucide-react";

export default function ManageSlots() {

  const navigate = useNavigate();

  const consultantId =
    localStorage.getItem("consultantId");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [slots, setSlots] = useState<any[]>([]);

  const fetchSlots = async () => {

    if (!consultantId || !date) return;

    try {

      const res = await fetch(
        `https://api.fundsarthi.in/api/consultant-slots?consultant_id=${consultantId}&date=${date}`
      );

      const data = await res.json();

      if (data.status === "success") {

        setSlots(data.data);

      }

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    fetchSlots();

  }, [date]);

  const addSlot = async () => {

    if (!date || !time) {
      alert("Select date & time");
      return;
    }

    try {

      const res = await fetch(
        "https://api.fundsarthi.in/api/add-slot",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            consultant_id: consultantId,
            date,
            time
          })
        }
      );

      const data = await res.json();

      if (data.status === "success") {

        alert("Slot Added");

        setTime("");

        fetchSlots();
      }

    } catch (err) {

      console.log(err);

    }
  };

  const deleteSlot = async (slotId: number) => {

    try {

      const res = await fetch(
        "https://api.fundsarthi.in/api/delete-slot",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            slot_id: slotId
          })
        }
      );

      const data = await res.json();

      if (data.status === "success") {

        fetchSlots();

      }

    } catch (err) {

      console.log(err);

    }
  };

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Header */}
      <div className="
        px-6
        py-4
        bg-white
        border-b
        flex
        items-center
        sticky
        top-0
        z-10
      ">

        <button
          onClick={() => navigate(-1)}
          className="
            w-10
            h-10
            rounded-full
            hover:bg-gray-100
            flex
            items-center
            justify-center
          "
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="ml-3">

          <h1 className="text-xl font-semibold">
            Manage Slots
          </h1>

          <p className="text-xs text-muted-foreground">
            Add your available consultation timings
          </p>

        </div>

      </div>

      {/* Content */}
      <div className="
        flex-1
        overflow-y-auto
        px-5
        py-5
        pb-28
      ">

        {/* Add Slot Card */}
        <div className="
          bg-white
          rounded-3xl
          border
          p-5
          shadow-sm
          mb-5
        ">

          <h2 className="
            text-lg
            font-semibold
            mb-5
          ">
            Add New Slot
          </h2>

          {/* Date */}
          <div className="mb-5">

            <label className="
              text-sm
              font-medium
              mb-2
              flex
              items-center
              gap-2
            ">

              <Calendar className="w-4 h-4" />

              Select Date

            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="
                w-full
                h-12
                rounded-2xl
                border
                px-4
                outline-none
                focus:border-primary
              "
            />

          </div>

          {/* Time */}
          <div className="mb-6">

            <label className="
              text-sm
              font-medium
              mb-2
              flex
              items-center
              gap-2
            ">

              <Clock3 className="w-4 h-4" />

              Select Time

            </label>

            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
              className="
                w-full
                h-12
                rounded-2xl
                border
                px-4
                outline-none
                focus:border-primary
              "
            />

          </div>

          {/* Button */}
          <button
            onClick={addSlot}
            className="
              w-full
              h-12
              rounded-2xl
              bg-primary
              text-white
              font-medium
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <Plus className="w-5 h-5" />

            Add Slot

          </button>

        </div>

        {/* Existing Slots */}
        {date && (

          <div className="
            bg-white
            rounded-3xl
            border
            p-5
            shadow-sm
          ">

            <h2 className="
              text-lg
              font-semibold
              mb-5
            ">
              Available Slots
            </h2>

            {slots.length === 0 && (

              <div className="
                py-10
                text-center
                text-sm
                text-muted-foreground
              ">

                No slots added yet

              </div>
            )}

            {slots.length > 0 && (

              <div className="
                grid
                grid-cols-2
                gap-3
              ">

                {slots.map((slot) => (

                  <div
                    key={slot.id}
                    className="
                      border
                      rounded-2xl
                      px-4
                      py-3
                      flex
                      items-center
                      justify-between
                      bg-primary/5
                    "
                  >

                    <span className="
                      text-sm
                      font-medium
                    ">
                      {slot.time}
                    </span>

                    <button
                      onClick={() =>
                        deleteSlot(slot.id)
                      }
                      className="
                        text-red-500
                      "
                    >

                      <Trash2 className="w-4 h-4" />

                    </button>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}