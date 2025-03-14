import { useState, useEffect } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function SelectDeckScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Decklist',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const [decks, setDecks] = useState([
    {
      title: 'European History',
      data: [
        { id: '1', name: 'European History Level 1' },
        { id: '2', name: 'European History Level 2' },
        { id: '3', name: 'European History Level 3' },
        { id: '4', name: 'European History Level 4' },
        { id: '5', name: 'European History Level 5' },
      ],
    },
    {
      title: 'Custom Decks',
      data: [
        { id: '6', name: 'User Deck 1' },
        { id: '7', name: 'User Deck 2' },
      ],
    },
  ]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.titleText} type="title">Select a Deck to Study</ThemedText>

      <SectionList
        sections={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.deckItem}
            onPress={() => navigation.navigate('study', { deckId: item.id })} // Pass the deckId to study screen
          >
            <Text style={styles.deckText}>{item.name}</Text>
          </Pressable>
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginBottom: 16,
  },
  deckItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  deckText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#f4f4f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});
