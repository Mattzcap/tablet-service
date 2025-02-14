import React from "react";
import { SafeAreaView } from "react-native";
import GeofencingMap from "./maps/geofencingMap"; // Import the map from maps folder

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GeofencingMap />
    </SafeAreaView>
  );
};

export default App;
