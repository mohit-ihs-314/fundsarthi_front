import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { GradientButton } from "../../components/ui/gradient-button";

export default function BookConsultation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dates, setDates] = useState<any[]>([]);
  const [slotTimes, setSlotTimes] = useState<any[]>([]);

  const [datesLoading, setDatesLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [datesError, setDatesError] = useState("");
  const [slotsError, setSlotsError] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  const expert = location.state?.expert;

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    propertyType: "",
    city: "",
    floorPlan: "",
    primaryReason: "",

    consultationTime: "",
    objective: "",
    consultationType: "",
    propertySize: "",

    date: "",
    time: "",
  });

  /*
   * -----------------------------------------
   * SCROLL TO TOP WHEN STEP CHANGES
   * -----------------------------------------
   */

  useEffect(() => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [step]);

  /*
   * -----------------------------------------
   * UPDATE FORM FIELD
   * -----------------------------------------
   */

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * -----------------------------------------
   * VALIDATION
   * -----------------------------------------
   */

  const validateStep1 = () => {
    return (
      formData.propertyType &&
      formData.city &&
      formData.floorPlan &&
      formData.primaryReason
    );
  };

  const validateStep2 = () => {
    return (
      formData.consultationTime &&
      formData.objective &&
      formData.consultationType &&
      formData.propertySize
    );
  };

  const validateStep3 = () => {
    return formData.date && formData.time;
  };

  /*
   * -----------------------------------------
   * SUBMIT BOOKING
   * -----------------------------------------
   */

  const handleSubmit = async () => {
    // Step 3 validation
    if (!validateStep3()) {
      alert("Please select a date and time slot");
      return;
    }

    if (!expert?.id) {
      alert("Consultant information is missing");
      return;
    }

    try {
      const payload = {
        consultant_id: expert.id,
        consultant_name: expert.full_name,

        user_mobile: localStorage.getItem("userMobile"),
        customer_name: localStorage.getItem("userName"),

        ...formData,
      };

      console.log("Booking Payload:", payload);

      const res = await fetch(
        "https://api.fundsarthi.in/api/book-consultation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("Booking Response:", data);

      if (data.status === "success") {
        navigate("/vastu/booking-confirmation", {
          state: {
            bookingId: data.booking_id,
            expert,
            formData,
          },
        });
      } else {
        alert(data.message || "Unable to book consultation");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong");
    }
  };

  /*
   * -----------------------------------------
   * OPTION BUTTON
   * -----------------------------------------
   */

  const OptionButton = ({
    selected,
    title,
    onClick,
  }: {
    selected: boolean;
    title: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left transition-all ${
        selected
          ? "bg-primary text-white border-primary"
          : "bg-card border-border hover:border-primary"
      }`}
    >
      {title}
    </button>
  );

  /*
   * -----------------------------------------
   * GET CONSULTANT AVAILABLE DATES
   * -----------------------------------------
   */

  useEffect(() => {
    if (!expert?.id) {
      setDates([]);
      return;
    }

    const loadDates = async () => {
      try {
        setDatesLoading(true);
        setDatesError("");

        console.log(
          "Loading dates for consultant:",
          expert.id
        );

        const url =
          `https://api.fundsarthi.in/api/consultant-available-dates` +
          `?consultant_id=${expert.id}`;

        console.log("Dates API:", url);

        const res = await fetch(url);

        console.log(
          "Dates API status:",
          res.status
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        console.log(
          "Dates API response:",
          data
        );

        if (data.status !== "success") {
          throw new Error(
            data.message || "Unable to load dates"
          );
        }

        const apiDates = Array.isArray(data.data)
          ? data.data
          : [];

        /*
         * TODAY
         */

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        /*
         * FORMAT DATES
         */

        const formattedDates = apiDates
          .map((date: string) => {
            const [year, month, day] = date
              .split("-")
              .map(Number);

            const d = new Date(
              year,
              month - 1,
              day
            );

            return {
              value: date,

              display: {
                date: d.getDate(),

                day:
                  date ===
                  new Date()
                    .toISOString()
                    .split("T")[0]
                    ? "Today"
                    : d.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                        }
                      ),

                month: d.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                  }
                ),
              },
            };
          })

          /*
           * REMOVE PAST DATES
           */

          .filter((item: any) => {
            const [year, month, day] = item.value
              .split("-")
              .map(Number);

            const slotDate = new Date(
              year,
              month - 1,
              day
            );

            slotDate.setHours(0, 0, 0, 0);

            return slotDate >= today;
          });

        console.log(
          "Final available dates:",
          formattedDates
        );

        setDates(formattedDates);
      } catch (error) {
        console.error(
          "Available dates error:",
          error
        );

        setDates([]);
        setDatesError(
          "Unable to load available dates."
        );
      } finally {
        setDatesLoading(false);
      }
    };

    loadDates();
  }, [expert?.id]);

  /*
   * -----------------------------------------
   * GET SLOTS FOR SELECTED DATE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!formData.date || !expert?.id) {
      setSlotTimes([]);
      return;
    }

    const loadSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsError("");

        /*
         * IMPORTANT:
         * Clear old slots immediately.
         *
         * Otherwise slots from the previously
         * selected date could temporarily appear.
         */

        setSlotTimes([]);

        const url =
          `https://api.fundsarthi.in/api/consultant-slots` +
          `?consultant_id=${expert.id}` +
          `&date=${formData.date}`;

        console.log(
          "Slots API:",
          url
        );

        const res = await fetch(url);

        console.log(
          "Slots API status:",
          res.status
        );

        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status}`
          );
        }

        const data = await res.json();

        console.log(
          "Slots API response:",
          data
        );

        /*
         * IF THERE ARE NO DATABASE RECORDS
         *
         * data.data = []
         *
         * We intentionally set [].
         */

        if (
          data.status === "success" &&
          Array.isArray(data.data)
        ) {
          setSlotTimes(data.data);
        } else {
          setSlotTimes([]);
        }
      } catch (error) {
        console.error(
          "Slots API error:",
          error
        );

        setSlotTimes([]);

        setSlotsError(
          "Unable to load available slots."
        );
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [formData.date, expert?.id]);

  /*
   * -----------------------------------------
   * CHECK WHETHER SLOT IS PAST
   * -----------------------------------------
   */

  const isPastSlot = (slotTime: string) => {
    if (!formData.date) {
      return false;
    }

    const today = new Date()
      .toISOString()
      .split("T")[0];

    /*
     * Only check time for TODAY.
     *
     * Future dates should show all their slots.
     */

    if (formData.date !== today) {
      return false;
    }

    const now = new Date();

    const [hours, minutes, seconds] = slotTime
      .split(":")
      .map(Number);

    const slotDate = new Date();

    slotDate.setHours(
      hours,
      minutes,
      seconds || 0,
      0
    );

    return slotDate <= now;
  };

  /*
   * -----------------------------------------
   * RENDER
   * -----------------------------------------
   */

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">

      {/* ---------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------- */}

      <div
        className="px-6 py-4 bg-card border-b border-border flex items-center"
        style={{
          paddingTop:
            "calc(16px + env(safe-area-inset-top))",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="ml-4 font-semibold">
          Get Expert Vastu Consultation
        </h1>
      </div>

      {/* ---------------------------------- */}
      {/* PROGRESS */}
      {/* ---------------------------------- */}

      <div className="px-6 pt-4">

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width:
                step === 1
                  ? "33%"
                  : step === 2
                  ? "66%"
                  : "100%",
            }}
          />
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          Step {step} of 3
        </p>

      </div>

      {/* ---------------------------------- */}
      {/* CONTENT */}
      {/* ---------------------------------- */}

      <div
        ref={contentRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-8"
      >

        {/* CONSULTANT */}

        {expert && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border">
            <p className="font-medium">
              {expert.full_name}
            </p>

            <p className="text-sm text-muted-foreground">
              Vastu Consultant
            </p>
          </div>
        )}

        {/* ================================== */}
        {/* STEP 1 */}
        {/* ================================== */}

        {step === 1 && (
          <div className="space-y-6">

            {/* PROPERTY TYPE */}

            <div>
              <h3 className="mb-3">
                1. What type of property do you need Vastu consultation for?
              </h3>

              <div className="space-y-2">
                {[
                  "Apartment",
                  "Independent House/Villa",
                  "Plot",
                  "Commercial Space",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.propertyType === item
                    }
                    onClick={() =>
                      updateField(
                        "propertyType",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* CITY */}

            <div>
              <h3 className="mb-3">
                2. City
              </h3>

              <div className="space-y-2">
                {[
                  "Delhi",
                  "Gurgaon",
                  "Sohna",
                  "Other",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.city === item
                    }
                    onClick={() =>
                      updateField(
                        "city",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* FLOOR PLAN */}

            <div>
              <h3 className="mb-3">
                3. Do you have a floor plan/layout available?
              </h3>

              <div className="space-y-2">
                {[
                  "Yes, ready to share",
                  "Yes, but need to locate it",
                  "No",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.floorPlan === item
                    }
                    onClick={() =>
                      updateField(
                        "floorPlan",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* PRIMARY REASON */}

            <div>
              <h3 className="mb-3">
                4. What is your primary reason for seeking Vastu consultation?
              </h3>

              <div className="space-y-2">
                {[
                  "New Home Planning",
                  "Home Vastu Correction",
                  "Business Growth",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.primaryReason ===
                      item
                    }
                    onClick={() =>
                      updateField(
                        "primaryReason",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================================== */}
        {/* STEP 2 */}
        {/* ================================== */}

        {step === 2 && (
          <div className="space-y-6">

            {/* CONSULTATION TIME */}

            <div>
              <h3 className="mb-3">
                5. When are you planning to take consultation?
              </h3>

              <div className="space-y-2">
                {[
                  "Within 3 Days",
                  "Within 1 Week",
                  "Within 1 Month",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.consultationTime ===
                      item
                    }
                    onClick={() =>
                      updateField(
                        "consultationTime",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* OBJECTIVE */}

            <div>
              <h3 className="mb-3">
                6. What is your primary objective?
              </h3>

              <div className="space-y-2">
                {[
                  "Financial Improvement",
                  "Health & Wellbeing",
                  "Relationship & Family Harmony",
                  "Commercial Property Planning",
                  "Plot Selection",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.objective ===
                      item
                    }
                    onClick={() =>
                      updateField(
                        "objective",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* CONSULTATION TYPE */}

            <div>
              <h3 className="mb-3">
                7. Preferred Consultation Type
              </h3>

              <div className="space-y-2">
                {[
                  "Online Consultation",
                  "Site Visit",
                  "Need Recommendation",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.consultationType ===
                      item
                    }
                    onClick={() =>
                      updateField(
                        "consultationType",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* PROPERTY SIZE */}

            <div>
              <h3 className="mb-3">
                8. Approximate Property Size
              </h3>

              <div className="space-y-2">
                {[
                  "Up to 1,000 Sq.ft.",
                  "1,000–2,000 Sq.ft.",
                  "2,000–4,000 Sq.ft.",
                  "Above 4,000 Sq.ft.",
                ].map((item) => (
                  <OptionButton
                    key={item}
                    title={item}
                    selected={
                      formData.propertySize ===
                      item
                    }
                    onClick={() =>
                      updateField(
                        "propertySize",
                        item
                      )
                    }
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================================== */}
        {/* STEP 3 */}
        {/* ================================== */}

        {step === 3 && (
          <div className="space-y-6">

            {/* -------------------------------- */}
            {/* SELECT DATE */}
            {/* -------------------------------- */}

            <div>

              <h3 className="mb-3">
                Select Date
              </h3>

              {/* LOADING */}

              {datesLoading && (
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loading available dates...
                  </p>
                </div>
              )}

              {/* ERROR */}

              {!datesLoading &&
                datesError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-center">

                    <p className="font-medium text-red-700">
                      {datesError}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        window.location.reload()
                      }
                      className="mt-3 text-sm underline text-red-700"
                    >
                      Try again
                    </button>

                  </div>
                )}

              {/* NO DATES */}

              {!datesLoading &&
                !datesError &&
                dates.length === 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-center">

                    <p className="font-medium">
                      No consultation dates available
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      This consultant currently has no available dates.
                    </p>

                  </div>
                )}

              {/* AVAILABLE DATES */}

              {!datesLoading &&
                dates.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">

                    {dates.map((d, i) => (
                      <button
                        key={`${d.value}-${i}`}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            date: d.value,
                            time: "",
                          }));

                          /*
                           * IMPORTANT:
                           * Remove slots from previous date
                           */
                          setSlotTimes([]);

                          setSlotsError("");
                        }}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] h-[82px] px-3 rounded-xl border transition-all ${
                          formData.date ===
                          d.value
                            ? "bg-primary text-white border-primary"
                            : "bg-card border-border hover:border-primary"
                        }`}
                      >

                        <span className="text-xs font-medium">
                          {d.display.day}
                        </span>

                        <span className="text-xl font-semibold">
                          {d.display.date}
                        </span>

                        <span className="text-xs">
                          {d.display.month}
                        </span>

                      </button>
                    ))}

                  </div>
                )}

            </div>

            {/* -------------------------------- */}
            {/* SELECT TIME */}
            {/* -------------------------------- */}

            {formData.date && (
              <div>

                <h3 className="mb-3">
                  Select Time Slot
                </h3>

                {/* LOADING */}

                {slotsLoading && (
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-center">

                    <p className="text-sm text-muted-foreground">
                      Loading available slots...
                    </p>

                  </div>
                )}

                {/* ERROR */}

                {!slotsLoading &&
                  slotsError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-center">

                      <p className="font-medium text-red-700">
                        {slotsError}
                      </p>

                    </div>
                  )}

                {/* SLOTS / NO SLOTS */}

                {!slotsLoading &&
                  !slotsError &&
                  (() => {
                    /*
                     * Remove past slots.
                     *
                     * If the database has ZERO slots,
                     * slotTimes will be [].
                     *
                     * Therefore availableSlots will
                     * also be [].
                     */

                    const availableSlots =
                      slotTimes.filter(
                        (slot: any) =>
                          !isPastSlot(
                            slot.value
                          )
                      );

                    /*
                     * NO AVAILABLE SLOT
                     *
                     * This covers:
                     *
                     * 1. No DB record for date
                     * 2. API returned data: []
                     * 3. All today's slots are past
                     */

                    if (
                      availableSlots.length ===
                      0
                    ) {
                      return (
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-center">

                          <p className="font-medium text-foreground">
                            All slots are booked for today
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Please select another date to continue.
                          </p>

                        </div>
                      );
                    }

                    /*
                     * AVAILABLE SLOTS
                     */

                    return (
                      <div className="grid grid-cols-3 gap-2">

                        {availableSlots.map(
                          (slot: any) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() =>
                                updateField(
                                  "time",
                                  slot.value
                                )
                              }
                              className={`py-3 rounded-xl border transition-all ${
                                formData.time ===
                                slot.value
                                  ? "bg-primary text-white border-primary"
                                  : "bg-card border-border hover:border-primary"
                              }`}
                            >
                              {slot.time}
                            </button>
                          )
                        )}

                      </div>
                    );
                  })()}

              </div>
            )}

          </div>
        )}

      </div>

      {/* ---------------------------------- */}
      {/* FOOTER */}
      {/* ---------------------------------- */}

      <div
        className="border-t border-border bg-card px-6 pt-4"
        style={{
          paddingBottom:
            "calc(8px + env(safe-area-inset-bottom))",
        }}
      >

        {/* STEP 1 */}

        {step === 1 && (
          <GradientButton
            className="w-full"
            disabled={!validateStep1()}
            onClick={() => setStep(2)}
          >
            Next
          </GradientButton>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 h-12 border border-border rounded-xl"
            >
              Back
            </button>

            <GradientButton
              className="flex-1"
              disabled={!validateStep2()}
              onClick={() => setStep(3)}
            >
              Next
            </GradientButton>

          </div>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 h-12 border border-border rounded-xl"
            >
              Back
            </button>

            <GradientButton
              className="flex-1"
              disabled={!validateStep3()}
              onClick={handleSubmit}
            >
              Submit
            </GradientButton>

          </div>
        )}

      </div>

    </div>
  );
}