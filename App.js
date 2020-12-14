//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import firebase from 'firebase';

import LoginScreen from './screens/auth/LoginScreen';
import { DashboardNavigation } from './screens/auth/DashboardScreen';
import LoadingScreen from './screens/auth/LoadingScreen';
import firebaseConfig from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default function App() {

  return(<AppNavigator />);
  
}

const appSwitchNavigator = createSwitchNavigator({
  LoadingScreen:LoadingScreen,
  LoginScreen:LoginScreen,
  DashboardScreen:DashboardNavigation
})

const AppNavigator = createAppContainer(appSwitchNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
