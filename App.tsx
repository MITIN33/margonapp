import AppNavigator from "./core/AppNavigator";
import React, { Component } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { ThemeProvider } from "react-native-elements";

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar barStyle='dark-content' />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }
}

const theme = {
  Button: {
    containerStyle: {
      height: 40,
      width: "100%",
      borderRadius: 5,
    }
  }
};

export default App;