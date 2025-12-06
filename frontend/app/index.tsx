import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

// Common timezones with their UTC offsets
const TIMEZONES = [
  { name: 'UTC', offset: 0 },
  { name: 'GMT (London)', offset: 0 },
  { name: 'CET (Paris, Berlin)', offset: 1 },
  { name: 'EET (Athens, Cairo)', offset: 2 },
  { name: 'MSK (Moscow)', offset: 3 },
  { name: 'GST (Dubai)', offset: 4 },
  { name: 'PKT (Karachi)', offset: 5 },
  { name: 'IST (India)', offset: 5.5 },
  { name: 'BST (Dhaka)', offset: 6 },
  { name: 'ICT (Bangkok, Jakarta)', offset: 7 },
  { name: 'CST (Beijing, Singapore)', offset: 8 },
  { name: 'JST (Tokyo)', offset: 9 },
  { name: 'AEST (Sydney)', offset: 10 },
  { name: 'NZST (Auckland)', offset: 12 },
  { name: 'HST (Hawaii)', offset: -10 },
  { name: 'AKST (Alaska)', offset: -9 },
  { name: 'PST (Los Angeles)', offset: -8 },
  { name: 'MST (Denver)', offset: -7 },
  { name: 'CST (Chicago)', offset: -6 },
  { name: 'EST (New York)', offset: -5 },
  { name: 'AST (Halifax)', offset: -4 },
  { name: 'BRT (São Paulo)', offset: -3 },
  { name: 'ART (Buenos Aires)', offset: -3 },
];

const STORAGE_KEYS = {
  TIMEZONE: '@timezone',
  BACKGROUND: '@background_image',
  TIME_FORMAT: '@time_format',
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[0]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [is24Hour, setIs24Hour] = useState(true);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
    requestPermissions();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload background images!'
        );
      }
    }
  };

  const loadPreferences = async () => {
    try {
      const savedTimezone = await AsyncStorage.getItem(STORAGE_KEYS.TIMEZONE);
      const savedBackground = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND);
      const savedTimeFormat = await AsyncStorage.getItem(STORAGE_KEYS.TIME_FORMAT);

      if (savedTimezone) {
        const timezone = JSON.parse(savedTimezone);
        setSelectedTimezone(timezone);
      }

      if (savedBackground) {
        setBackgroundImage(savedBackground);
      }

      if (savedTimeFormat) {
        setIs24Hour(savedTimeFormat === '24');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveTimezone = async (timezone: typeof TIMEZONES[0]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMEZONE, JSON.stringify(timezone));
      setSelectedTimezone(timezone);
    } catch (error) {
      console.error('Error saving timezone:', error);
    }
  };

  const saveBackground = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND, imageUri);
      setBackgroundImage(imageUri);
    } catch (error) {
      console.error('Error saving background:', error);
    }
  };

  const handleScreenTap = () => {
    setTapCount((prev) => prev + 1);

    // Clear previous timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    // Set new timer to reset tap count after 2 seconds
    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    // Check if reached 6 taps
    if (tapCount + 1 === 6) {
      setShowSettings(true);
      setTapCount(0);
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await saveBackground(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const resetToDefault = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.BACKGROUND);
      setBackgroundImage(null);
      Alert.alert('Success', 'Background reset to default');
    } catch (error) {
      console.error('Error resetting background:', error);
    }
  };

  const getTimeInTimezone = () => {
    const utcTime = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const timezoneTime = new Date(utcTime + selectedTimezone.offset * 3600000);
    return timezoneTime;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${month} ${day}, ${year}`;
  };

  const displayTime = getTimeInTimezone();

  const backgroundContent = (
    <Pressable style={styles.container} onPress={handleScreenTap}>
      <StatusBar style="light" />
      <View style={styles.clockContainer}>
        <Text style={styles.timeText}>{formatTime(displayTime)}</Text>
        <Text style={styles.dateText}>{formatDate(displayTime)}</Text>
        <Text style={styles.timezoneText}>{selectedTimezone.name}</Text>
        
        {tapCount > 0 && tapCount < 6 && (
          <View style={styles.tapIndicator}>
            <Text style={styles.tapText}>{tapCount} / 6</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.wrapper}>
      {backgroundImage ? (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={styles.container}
          resizeMode="cover"
        >
          {backgroundContent}
        </ImageBackground>
      ) : (
        backgroundContent
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            {/* Timezone Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Timezone</Text>
              <ScrollView style={styles.timezoneList} showsVerticalScrollIndicator={true}>
                {TIMEZONES.map((timezone, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timezoneItem,
                      selectedTimezone.name === timezone.name && styles.selectedTimezone,
                    ]}
                    onPress={() => saveTimezone(timezone)}
                  >
                    <Text
                      style={[
                        styles.timezoneItemText,
                        selectedTimezone.name === timezone.name && styles.selectedTimezoneText,
                      ]}
                    >
                      {timezone.name}
                    </Text>
                    <Text style={styles.timezoneOffset}>
                      UTC{timezone.offset >= 0 ? '+' : ''}{timezone.offset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Background Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Background</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={resetToDefault}
                >
                  <Text style={styles.buttonText}>Reset Default</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    padding: 20,
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadow: '2px 2px 10px rgba(0, 0, 0, 0.75)',
  },
  dateText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    opacity: 0.9,
    textShadow: '1px 1px 5px rgba(0, 0, 0, 0.75)',
  },
  timezoneText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.7,
    textShadow: '1px 1px 5px rgba(0, 0, 0, 0.75)',
  },
  tapIndicator: {
    position: 'absolute',
    bottom: -60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tapText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timezoneList: {
    maxHeight: 300,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  timezoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  selectedTimezone: {
    backgroundColor: '#4a4a4a',
  },
  timezoneItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedTimezoneText: {
    fontWeight: 'bold',
  },
  timezoneOffset: {
    fontSize: 14,
    color: '#999999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
