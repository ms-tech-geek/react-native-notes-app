import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { AppNavigator } from './navigation/AppNavigator';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
};

export default App;