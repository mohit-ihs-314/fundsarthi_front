import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Building2,
  FileText,
  User,
  Calendar,
  Briefcase,
  Eye,
  RefreshCcw,
  Clock3
} from "lucide-react";

import { BottomNav } from "../../components/BottomNav";

export default function Activities() {

  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchActivities();

  }, []);

  const fetchActivities = async () => {

    const mobile =
      localStorage.getItem("userMobile");

    if (!mobile) {
      setLoading(false);
      return;
    }

    try {

      const res = await fetch(
        `https://api.fundsarthi.in/api/activities?mobile=${mobile}`
      );

      const data = await res.json();

      if (data.status === "success") {
        setActivities(data.data);
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  const getIcon = (type) => {

    switch (type) {

      case "loan":
      case "loan_status":
      case "loan_view":
        return FileText;

      case "property":
      case "visit":
        return Building2;

      case "consultation":
      case "consultation_view":
      case "consultation_status":
      case "consultation_reschedule":
        return Calendar;

      case "consultant_apply":
        return Briefcase;

      case "view":
        return Eye;

      default:
        return User;
    }
  };

  const getColor = (type) => {

    switch (type) {

      case "loan":
      case "loan_status":
      case "loan_view":
        return "bg-blue-100 text-blue-600";

      case "property":
      case "visit":
        return "bg-orange-100 text-orange-600";

      case "consultation":
      case "consultation_view":
      case "consultation_status":
      case "consultation_reschedule":
        return "bg-green-100 text-green-600";

      case "consultant_apply":
        return "bg-purple-100 text-purple-600";

      case "view":
        return "bg-pink-100 text-pink-600";

      default:
        return "bg-primary/10 text-primary";
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
        border-gray-100
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
            transition
          "
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="ml-3">
          <h1 className="text-xl font-semibold">
            Activities
          </h1>

          <p className="text-xs text-muted-foreground mt-0.5">
            Your recent actions & updates
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

        {/* Loading */}
        {loading && (

          <div className="
            flex
            items-center
            justify-center
            py-20
          ">

            <div className="
              w-10
              h-10
              border-4
              border-primary/20
              border-t-primary
              rounded-full
              animate-spin
            " />

          </div>
        )}

        {/* Empty State */}
        {!loading && activities.length === 0 && (

          <div className="
            bg-white
            border
            border-gray-100
            rounded-3xl
            p-8
            text-center
            shadow-sm
          ">

            <div className="
              w-16
              h-16
              mx-auto
              rounded-full
              bg-primary/10
              flex
              items-center
              justify-center
              mb-4
            ">

              <Clock3 className="
                w-8
                h-8
                text-primary
              " />

            </div>

            <h2 className="text-lg font-semibold mb-2">
              No Activities Yet
            </h2>

            <p className="text-sm text-muted-foreground">
              Your recent actions and updates will appear here.
            </p>

          </div>
        )}

        {/* Activities */}
        {!loading && activities.length > 0 && (

          <div className="space-y-4">

            {activities.map((activity) => {

              const Icon =
                getIcon(activity.type);

              const color =
                getColor(activity.type);

              return (

                <div
                  key={activity.id}
                  className="
                    bg-white
                    border
                    border-gray-100
                    rounded-3xl
                    p-4
                    flex
                    gap-4
                    shadow-sm
                    hover:shadow-md
                    transition-all
                  "
                >

                  {/* Icon */}
                  <div className={`
                    w-12
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    ${color}
                  `}>

                    <Icon className="
                      w-5
                      h-5
                    " />

                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <h3 className="
                      font-semibold
                      text-[15px]
                      leading-snug
                    ">
                      {activity.title}
                    </h3>

                    <p className="
                      text-sm
                      text-muted-foreground
                      mt-1
                      leading-relaxed
                    ">
                      {activity.description}
                    </p>

                    <div className="
                      flex
                      items-center
                      gap-2
                      mt-3
                    ">

                      <Clock3 className="
                        w-3.5
                        h-3.5
                        text-gray-400
                      " />

                      <p className="
                        text-xs
                        text-gray-400
                      ">
                        {new Date(
                          activity.created_at
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      <BottomNav />

    </div>
  );
}