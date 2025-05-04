import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // Replace lucide-react-native with Expo's vector icons

export default function ModalScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="chevron-left" size={24} color="#2563eb" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Modal Screen</Text>
        <Text style={styles.description}>
          This is a modal screen that can be used for various purposes like match details,
          player profiles, or settings.
        </Text>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
});