// CIFAMobileApp/app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Send all users directly to the home tab
  // Staff will still be able to access login from the "More" tab
  return <Redirect href="/(tabs)" />;
}