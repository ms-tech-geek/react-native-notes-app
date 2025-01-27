import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { NotesListScreen } from '../screens/NotesListScreen';
import { EditNoteScreen } from '../screens/EditNoteScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NotesList" 
          component={NotesListScreen}
          options={{ title: 'My Notes' }}
        />
        <Stack.Screen 
          name="EditNote" 
          component={EditNoteScreen}
          options={{ title: 'Edit Note' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};