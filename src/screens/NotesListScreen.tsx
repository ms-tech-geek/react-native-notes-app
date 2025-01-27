import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, List, Searchbar } from 'react-native-paper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export const NotesListScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    loadNotes();
    setupRealtimeSync();
    logger.info('NotesListScreen mounted', { userId });
  }, []);

  const loadNotes = async () => {
    try {
      logger.debug('Loading notes', { userId });
      
      // Load local notes
      const localNotes = await AsyncStorage.getItem(`notes_${userId}`);
      if (localNotes) {
        setNotes(JSON.parse(localNotes));
        logger.info('Local notes loaded', { count: Object.keys(JSON.parse(localNotes)).length });
      }
      
      // Sync with Firebase if online
      const snapshot = await database()
        .ref(`notes/${userId}`)
        .once('value');
      const firebaseNotes = snapshot.val() || {};
      logger.info('Firebase notes synced', { count: Object.keys(firebaseNotes).length });
      
      // Merge and save locally
      const mergedNotes = { ...JSON.parse(localNotes || '{}'), ...firebaseNotes };
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(mergedNotes));
      setNotes(Object.values(mergedNotes));
    } catch (error) {
      logger.error('Error loading notes', error);
    }
  };

  const setupRealtimeSync = () => {
    logger.debug('Setting up realtime sync');
    database()
      .ref(`notes/${userId}`)
      .on('value', snapshot => {
        const firebaseNotes = snapshot.val() || {};
        setNotes(Object.values(firebaseNotes));
        AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(firebaseNotes))
          .then(() => logger.info('Notes synced and saved locally'))
          .catch(error => logger.error('Error saving synced notes locally', error));
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
        onChangeText={query => {
          setSearchQuery(query);
          logger.debug('Search query updated', { query });
        }}
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
            onPress={() => {
              logger.debug('Note selected', { noteId: item.id });
              navigation.navigate('EditNote', { noteId: item.id });
            }}
            left={props => <List.Icon {...props} icon="note" />}
          />
        )}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          logger.debug('Creating new note');
          navigation.navigate('EditNote');
        }}
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