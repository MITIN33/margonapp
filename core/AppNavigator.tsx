import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { observer } from "mobx-react";
import React, { Component } from "react";
import LoginScreen from "../screens/LoginScreen";
import { userstore } from "../stores/UserStore";
import TabNavigation from "../screens/TabNavigation";
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import SignupScreen from "../screens/SignUpScreen";
import ChatScreen from "../screens/ChatScreen";
import { ActivityIndicator } from "react-native";
import AppTheme from "../theme/AppTheme";
import { Icon } from "react-native-elements";

const Stack = createStackNavigator();

@observer
class AppNavigator extends Component {

    constructor(props) {
        super(props);
        if (Platform.OS !== 'ios')
            StatusBar.setBackgroundColor('#71afe5');
    }

    componentDidMount() {
        userstore.fetchUser()
            .then(() => {
                userstore.setIsUserLoading(false);
            })
    }

    render() {

        if (userstore.isUserloading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>
        }

        return (
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: AppTheme.colors.themeColor,
                                elevation: 0,
                                shadowOpacity: 0
                            },
                            headerRight: () => (<Icon name='ellipsis-vertical-outline' type='ionicon' />)
                        }}
                    >
                        {userstore.isUserSigned ?
                            (

                                <>
                                    <Stack.Screen name="Home" component={TabNavigation} options={{
                                        title: 'Home',
                                        headerLeft: () => (<Icon name='person-circle-outline' size={30} type='ionicon' style={{ marginLeft: 15 }} />)
                                    }} />
                                    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
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
            </KeyboardAvoidingView >
        );
    };
}

export default AppNavigator;