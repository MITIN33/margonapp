import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { observer } from "mobx-react";
import React, { Component } from "react";
import LoginScreen from "../screens/LoginScreen";
import { userstore } from "../stores/UserStore";
import TabNavigation from "../screens/TabNavigation";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import SignupScreen from "../screens/SignUpScreen";
import ChatScreen from "../screens/ChatScreen";
import { ActivityIndicator } from "react-native-paper";

const Stack = createStackNavigator();

@observer
class AppNavigator extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log('loading user');
        userstore.loadUser();
    }

    render() {

        if (userstore.isUserloading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>
        }

        console.log(userstore.user);
        return (
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <NavigationContainer>
                    <Stack.Navigator>

                        {userstore.isUserSigned ?
                            (

                                <>
                                    <Stack.Screen name="Home" component={TabNavigation} options={{ title: 'Home', headerTitleAlign: "center", }} />
                                    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Home', headerTitleAlign: "center", }} />
                                </>
                            ) :
                            (
                                <>
                                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="SignUp" component={SignupScreen} />
                                </>
                            )}
                    </Stack.Navigator>
                </NavigationContainer>
            </KeyboardAvoidingView>
        );
    };
}

export default AppNavigator;