import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, FAB, Portal, Dialog, Button, Text } from 'react-native-paper';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { PDFDocument } from 'react-native-pdf';
import { logger } from '../utils/logger';

export const EditNoteScreen = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const noteId = route.params?.noteId;
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (noteId) {
      logger.debug('Loading existing note', { noteId });
      loadNote();
    } else {
      logger.debug('Creating new note');
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      const localNotes = await AsyncStorage.getItem(`notes_${userId}`);
      const notes = JSON.parse(localNotes || '{}');
      if (notes[noteId]) {
        setTitle(notes[noteId].title);
        setContent(notes[noteId].content);
        logger.info('Note loaded successfully', { noteId });
      }
    } catch (error) {
      logger.error('Error loading note', error);
    }
  };

  const saveNote = async () => {
    try {
      logger.debug('Saving note', { noteId, title });
      const newNote = {
        id: noteId || Date.now().toString(),
        title,
        content,
        updatedAt: new Date().toISOString(),
      };

      // Save locally
      const localNotes = await AsyncStorage.getItem(`notes_${userId}`);
      const notes = JSON.parse(localNotes || '{}');
      notes[newNote.id] = newNote;
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(notes));
      logger.info('Note saved locally', { noteId: newNote.id });

      // Save to Firebase
      await database()
        .ref(`notes/${userId}/${newNote.id}`)
        .set(newNote);
      logger.info('Note synced to Firebase', { noteId: newNote.id });

      navigation.goBack();
    } catch (error) {
      logger.error('Error saving note', error);
    }
  };

  const exportToPDF = async () => {
    try {
      logger.debug('Starting PDF export', { noteId });
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      
      page.drawText(title, {
        x: 50,
        y: page.getHeight() - 50,
        size: 20,
      });
      
      page.drawText(content, {
        x: 50,
        y: page.getHeight() - 100,
        size: 12,
      });

      const pdfBytes = await pdfDoc.save();
      const path = `${RNFS.DocumentDirectoryPath}/note_${noteId}.pdf`;
      
      await RNFS.writeFile(path, pdfBytes, 'base64');
      logger.info('PDF exported successfully', { path });
      setShowExportDialog(true);
    } catch (error) {
      logger.error('Error exporting PDF', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.title}
      />
      <TextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        mode="outlined"
        multiline
        style={styles.content}
      />
      <Portal>
        <Dialog visible={showExportDialog} onDismiss={() => setShowExportDialog(false)}>
          <Dialog.Title>PDF Exported</Dialog.Title>
          <Dialog.Content>
            <Text>Your note has been exported as PDF successfully.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExportDialog(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <FAB.Group
        open={false}
        icon="plus"
        actions={[
          {
            icon: 'content-save',
            label: 'Save',
            onPress: saveNote,
          },
          {
            icon: 'file-pdf-box',
            label: 'Export PDF',
            onPress: exportToPDF,
          },
        ]}
        onStateChange={() => {}}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});