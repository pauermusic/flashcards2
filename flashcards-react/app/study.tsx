import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRoute } from 'expo-router';
// import * as SQLite from 'expo-sqlite'; // Importing SQLite

const db = SQLite.openDatabase('my_database.db'); // Make sure the SQLite database is properly initialized

export default function StudyScreen() {
  const route = useRoute(); // Get the passed params (deckId)
  const { deckId } = route.params; // Extract the deckId

  const [deckData, setDeckData] = useState([]);

  useEffect(() => {
    // Query the SQLite table based on the deckId passed from the SelectDeckScreen
    const fetchDeckData = async () => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM deck_${deckId}`, // Assuming your tables are named based on deckId
          [],
          (_, { rows }) => setDeckData(rows._array), // Update state with the queried data
          (t, error) => console.log(error)
        );
      });
    };

    fetchDeckData();
  }, [deckId]); // Re-fetch data when deckId changes

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Deck {deckId}</Text>

      {/* Display the deck data (e.g., flashcards) */}
      <FlatList
        data={deckData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.question}</Text>
            <Text style={styles.cardText}>{item.answer}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardText: {
    fontSize: 16,
    marginVertical: 4,
  },
});
