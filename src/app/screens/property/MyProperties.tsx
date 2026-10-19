import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
    ArrowLeft,
    MapPin,
    Building2,
    Clock3
} from "lucide-react";

import { BottomNav } from "../../components/BottomNav";

export default function MyProperties() {

    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchProperties();

    }, []);

    const fetchProperties = async () => {

        const mobile =
            localStorage.getItem("userMobile");

        if (!mobile) {
            setLoading(false);
            return;
        }

        try {

            const res = await fetch(
                `https://api.fundsarthi.in/api/my-properties?mobile=${mobile}`
            );

            const data = await res.json();

            if (data.status === "success") {
                setProperties(data.data);
            }

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

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
                        My Listings
                    </h1>

                    <p className="text-xs text-muted-foreground">
                        Your posted properties
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

                {/* Empty */}
                {!loading && properties.length === 0 && (

                    <div className="
            bg-white
            rounded-3xl
            border
            p-8
            text-center
            shadow-sm
          ">

                        <div className="
              w-16
              h-16
              rounded-full
              bg-primary/10
              mx-auto
              flex
              items-center
              justify-center
              mb-4
            ">

                            <Building2 className="
                w-8
                h-8
                text-primary
              " />

                        </div>

                        <h2 className="text-lg font-semibold">
                            No Listings Yet
                        </h2>

                        <p className="
              text-sm
              text-muted-foreground
              mt-2
            ">
                            You haven't posted any property yet.
                        </p>

                    </div>
                )}

                {/* List */}
                {!loading && properties.length > 0 && (

                    <div className="space-y-5">

                        {properties.map((property) => (

                            <div
                                key={property.id}
                                onClick={() =>
                                    navigate(`/property/${property.id}`)
                                }
                                className="
                  bg-white
                  rounded-3xl
                  overflow-hidden
                  border
                  shadow-sm
                  active:scale-[0.99]
                  transition-all
                "
                            >

                                {/* Image */}
                                <div className="
                  h-52
                  bg-gray-100
                  overflow-hidden
                ">

                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        className="
                      w-full
                      h-full
                      object-cover
                    "
                                    />

                                </div>

                                {/* Content */}
                                <div className="p-4">

                                    <div className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  ">

                                        <div>

                                            <h3 className="
                        font-semibold
                        text-lg
                      ">
                                                {property.title}
                                            </h3>

                                            <div className="
                        flex
                        items-center
                        gap-1
                        mt-1
                        text-muted-foreground
                      ">

                                                <MapPin className="w-4 h-4" />

                                                <p className="text-sm">
                                                    {property.locality},
                                                    {" "}
                                                    {property.city}
                                                </p>

                                            </div>

                                        </div>

                                        <div className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${property.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }
                    `}>

                                            {property.status}

                                        </div>

                                    </div>

                                    {/* Price */}
                                    <div className="
                    mt-4
                    flex
                    items-center
                    justify-between
                  ">

                                        <div>

                                            <p className="
                        text-primary
                        text-xl
                        font-bold
                      ">
                                                ₹ {property.price}
                                            </p>

                                            <p className="
                        text-xs
                        text-muted-foreground
                        mt-1
                      ">
                                                {property.property_type}
                                                {" • "}
                                                {property.purpose}
                                            </p>

                                        </div>

                                        <div className="
                      flex
                      items-center
                      gap-1
                      text-xs
                      text-gray-400
                    ">

                                            <Clock3 className="w-3.5 h-3.5" />

                                            <p className="
  text-xs
  text-gray-400
">
                                                {property.created_at
                                                    ? new Date(property.created_at).toLocaleDateString()
                                                    : "Recently Added"}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

            <BottomNav />

        </div>
    );
}