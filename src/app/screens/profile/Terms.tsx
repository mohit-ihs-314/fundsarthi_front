import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Shield,
  Info,
  FileText
} from "lucide-react";

export default function Terms() {

  const navigate = useNavigate();

  const items = [
    {
      icon: Shield,
      title: "Privacy Policy",
      path: "/privacy-policy"
    },
    {
      icon: FileText,
      title: "Terms & Conditions",
      path: "/terms-conditions"
    },
    {
      icon: Info,
      title: "About Us",
      path: "/about-us"
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="
        px-6
        py-5
        bg-white
        border-b
        flex
        items-center
        gap-4
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

        <h1 className="text-xl font-semibold">
          Terms of Use
        </h1>

      </div>

      {/* Content */}
      <div className="p-5">

        <div className="
          bg-white
          border
          rounded-3xl
          overflow-hidden
          shadow-sm
        ">

          {items.map((item, index) => {

            const Icon = item.icon;

            return (

              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-4
                  px-5
                  py-5
                  text-left
                  hover:bg-gray-50
                  transition
                  ${index !== items.length - 1
                    ? "border-b"
                    : ""
                  }
                `}
              >

                <div className="
                  w-11
                  h-11
                  rounded-xl
                  bg-primary/10
                  flex
                  items-center
                  justify-center
                ">

                  <Icon className="
                    w-5
                    h-5
                    text-primary
                  " />

                </div>

                <p className="
                  text-[16px]
                  font-medium
                ">
                  {item.title}
                </p>

              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
}