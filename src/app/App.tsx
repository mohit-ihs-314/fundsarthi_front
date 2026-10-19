import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

import { App as CapacitorApp } from "@capacitor/app";

// ✅ IMPORT THIS
import { requestLocation } from "./utils/location";

export default function App() {
  const [loading, setLoading] = useState(true);

  // Splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 📍 Ask location permission
  useEffect(() => {
    requestLocation();
  }, []);

  // Android back button
  useEffect(() => {
    let backHandler: any;

    CapacitorApp.addListener("backButton", () => {
      const path = window.location.pathname;

      if (path === "/home" || path === "/") {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    }).then((listener) => {
      backHandler = listener;
    });

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-background overflow-auto">
      <div
        className="w-full h-full flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {loading ? (
          <SplashScreen />
        ) : (
          <RouterProvider router={router} />
        )}
      </div>
    </div>
  );
}