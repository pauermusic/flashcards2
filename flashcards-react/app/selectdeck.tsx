import { useState, useEffect } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet, Image } from 'react-native';
import { useNavigation } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

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
      icon: 'book',
      data: [
        { id: '1', name: 'European History Level 1', cards: 24, progress: 0 },
        { id: '2', name: 'European History Level 2', cards: 36, progress: 0 },
        { id: '3', name: 'European History Level 3', cards: 28, progress: 0 },
        { id: '4', name: 'European History Level 4', cards: 32, progress: 0 },
        { id: '5', name: 'European History Level 5', cards: 40, progress: 0 },
      ],
    },
    {
      title: 'Custom Decks',
      icon: 'create',
      data: [
        { id: '6', name: 'User Deck 1', cards: 18, progress: 0 },
        { id: '7', name: 'User Deck 2', cards: 12, progress: 0 },
      ],
    },
  ]);

  const renderProgressBar = (progress) => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.titleText} type="title">My Flashcards</ThemedText>

      <SectionList
        sections={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.deckItem,
              pressed && styles.deckItemPressed
            ]}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            onPress={() => navigation.navigate('study', { deckId: item.id })}
          >
            <View style={styles.deckContent}>
              <View style={styles.deckInfo}>
                <ThemedText style={styles.deckText}>{item.name}</ThemedText>
                <View style={styles.deckMeta}>
                  <Ionicons name="card-outline" size={14} color="#666" />
                  <Text style={styles.cardCount}>{item.cards} cards</Text>
                </View>
                {renderProgressBar(item.progress)}
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </View>
            </View>
          </Pressable>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderContainer}>
            <Ionicons name={section.icon} size={22} color="#555" />
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
      />

      <Pressable 
        style={styles.addButton}
        onPress={() => navigation.navigate('create-deck')}
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 4,
  },
  deckItem: {
    padding: 16,
    marginVertical: 6,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deckItemPressed: {
    backgroundColor: '#f9f9f9',
  },
  deckContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckInfo: {
    flex: 1,
  },
  deckText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deckMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    position: 'absolute',
    right: 0,
    top: -14,
  },
  arrowContainer: {
    justifyContent: 'center',
    padding: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginLeft: 6,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});