import { StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pressable } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'FlashLearn',
      headerTitleAlign: 'center', // This centers the title in the header
    });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      {/* Grid Container */}
      <ThemedView style={styles.gridContainer}>
        {/* Study Button - Full Width */}
        <Pressable onPress={() => navigation.navigate('studycards')} style={[styles.gridItem, styles.studyButton]}>
          <ThemedText type="subtitle">Study</ThemedText>
        </Pressable>

        {/* Other Buttons - 2x2 Layout */}
        <Pressable onPress={() => navigation.navigate('deckviewer')} style={styles.gridItem}>
          <ThemedText type="subtitle">View Decks</ThemedText>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('cardviewer')} style={styles.gridItem}>
          <ThemedText type="subtitle">View Cards</ThemedText>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('settings')} style={styles.gridItem}>
          <ThemedText type="subtitle">Settings</ThemedText>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('additional')} style={styles.gridItem}>
          <ThemedText type="subtitle">Additional Option</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f4f4f9', // Background color for the entire page
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  gridItem: {
    width: '48%', // Default width for grid items
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff', // White buttons
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 12, // Rounded corners for modern look
  },
  studyButton: {
    width: '100%', // Full width for Study button
    height: 200, // Taller button for prominence
  },
});