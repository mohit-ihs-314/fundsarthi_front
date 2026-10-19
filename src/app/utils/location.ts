export const requestLocation = async () => {

  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    window.dispatchEvent(new Event("locationFailed"));
    return;
  }

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log("LAT LNG =", lat, lng);

      // Save coordinates
      localStorage.setItem("userLatitude", lat.toString());
      localStorage.setItem("userLongitude", lng.toString());

      console.log("Saved Coordinates:", lat, lng);

      console.log("LAT LNG =", lat, lng);

      try {

        // Reverse geocode
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        const data = await res.json();

        console.log("LOCATION DATA =", data);

        const city =
          data.address.city ||
          data.address.state_district ||
          data.address.state ||
          "";

        const locality =
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.village ||
          "";

        // SAVE
        localStorage.setItem(
          "userCity",
          city
        );

        localStorage.setItem(
          "userLocality",
          locality
        );

        console.log(
          "SAVED LOCATION =",
          locality,
          city
        );

        // 🔥 VERY IMPORTANT
        window.dispatchEvent(
          new Event("locationUpdated")
        );

      } catch (err) {
        console.error(
          "Location fetch error:",
          err
        );
        window.dispatchEvent(new Event("locationFailed"));
      }
    },

    (error) => {
      console.error(
        "Location permission denied:",
        error
      );
      window.dispatchEvent(new Event("locationFailed"));
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};