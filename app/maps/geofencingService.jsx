import BackgroundGeolocation from "react-native-background-geolocation";
import { Alert } from "react-native";

export const GEOFENCE_LOCATIONS = [
  {
    identifier: "Location 1",
    latitude: 14.5995, // Manila
    longitude: 120.9842,
    radius: 200,
  },
  {
    identifier: "Location 2",
    latitude: 14.6816, // Quezon City
    longitude: 121.0632,
    radius: 40,
  },
];

export const startGeofencing = async () => {
  try {
    console.log("🔍 Initializing Background Geofencing...");

    // Configure Background Geolocation
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      distanceFilter: 50,
      stopTimeout: 5,
      debug: true,
      stopOnTerminate: false,
      startOnBoot: true,
      locationAuthorizationRequest: "Always",
      backgroundPermissionRationale: {
        title: "Allow Background Location",
        message: "This app needs background location access to detect geofences.",
        positiveAction: "Allow",
        negativeAction: "Deny",
      },
      geofenceModeHighAccuracy: true,
    }).then((state) => {
      console.log("✅ Background geofencing configured successfully.", state);
      
      // Clear existing geofences to prevent duplicates
      BackgroundGeolocation.removeGeofences(() => {
        console.log("♻️ Existing geofences cleared.");

        // Add geofences
        BackgroundGeolocation.addGeofences(GEOFENCE_LOCATIONS.map((geo) => ({
          identifier: geo.identifier,
          latitude: geo.latitude,
          longitude: geo.longitude,
          radius: geo.radius,
          notifyOnEntry: true,
          notifyOnExit: true,
        })));

        // Listen for geofence events
        BackgroundGeolocation.onGeofence((event) => {
          const action = event.action === "ENTER" ? "Entered" : "Exited";
          console.log(`📍 ${action} geofence: ${event.identifier}`);
          Alert.alert("Geofence Alert", `${action} ${event.identifier}`);
        });

        // Start tracking
        BackgroundGeolocation.startGeofences();
      });
    });
  } catch (error) {
    console.error("❌ Error starting geofencing:", error);
  }
};

export const stopGeofencing = async () => {
  console.log("🛑 Stopping Geofencing...");
  await BackgroundGeolocation.stop();
  console.log("✅ Geofencing stopped.");
};

export default { startGeofencing, stopGeofencing, GEOFENCE_LOCATIONS };
