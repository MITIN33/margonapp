import AppNavigator from "./core/AppNavigator";
import React, { Component } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { KeyboardAvoidingView, ScrollView, StatusBar } from "react-native";
import { ScrollPager } from "react-native-tab-view";

class App extends Component {
  render() {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar barStyle='dark-content'/>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  },
};

export default App;