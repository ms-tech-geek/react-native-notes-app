import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, List, Searchbar } from 'react-native-paper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotesListScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    loadNotes();
    setupRealtimeSync();
  }, []);

  const loadNotes = async () => {
    try {
      // Load local notes
      const localNotes = await AsyncStorage.getItem(`notes_${userId}`);
      if (localNotes) {
        setNotes(JSON.parse(localNotes));
      }
      
      // Sync with Firebase if online
      const snapshot = await database()
        .ref(`notes/${userId}`)
        .once('value');
      const firebaseNotes = snapshot.val() || {};
      
      // Merge and save locally
      const mergedNotes = { ...JSON.parse(localNotes || '{}'), ...firebaseNotes };
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(mergedNotes));
      setNotes(Object.values(mergedNotes));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const setupRealtimeSync = () => {
    database()
      .ref(`notes/${userId}`)
      .on('value', snapshot => {
        const firebaseNotes = snapshot.val() || {};
        setNotes(Object.values(firebaseNotes));
        AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(firebaseNotes));
      });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search notes"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.content.substring(0, 50) + '...'}
            onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
            left={props => <List.Icon {...props} icon="note" />}
          />
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('EditNote')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});