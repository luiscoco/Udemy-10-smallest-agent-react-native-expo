import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CourseProvider } from "../lib/state";
export default function Layout() {
  return (
    <SafeAreaProvider>
      <CourseProvider>
        <Slot />
      </CourseProvider>
    </SafeAreaProvider>
  );
}
