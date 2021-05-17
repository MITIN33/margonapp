import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { observer } from "mobx-react";
import React, { Component } from "react";
import LoginScreen from "../screens/LoginScreen";
import { userstore } from "../stores/UserStore";
import TabNavigation from "../screens/TabNavigation";
import SettingsScreen from "../screens/SettingsScreen";
import { View } from "react-native";
import SignupScreen from "../screens/SignUpScreen";
import ChatScreen from "../screens/ChatScreen";
import { ActivityIndicator } from "react-native";
import AppTheme from "../theme/AppTheme";
import { Avatar, Icon } from "react-native-elements";
import GetStartedScreen from "../screens/GetStartedScreen";
import VerificationScreen from "../screens/VerificationScreen";
import { authStore } from "../stores/AuthStore";
import { Button } from 'react-native-elements';
import ProfileImageScreen from "../screens/ProfileImageScreen";

const Stack = createStackNavigator();

@observer
class AppNavigator extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        }
    }

    componentDidMount() {
        userstore.init()
            .finally(() => this.setState({ isLoading: false }))
    }
    render() {
        if (this.state.isLoading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>
        }
        const firstName = userstore.user?.firstName;
        const photoUrl = userstore.user?.profilePicUrl;

        return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {authStore.isUserSigned ?
                        (
                            <>
                                <Stack.Screen name="Home" component={TabNavigation} options={({ navigation }) => ({
                                    title: firstName,
                                    headerLeft: () => (
                                        <Avatar source={{ uri: photoUrl }} containerStyle={{ paddingLeft: 15, width: 50 }} rounded ></Avatar>
                                    ),
                                    headerShown: true,
                                    headerRight: () => (
                                        <Button
                                            type='clear'
                                            icon={<Icon name='options-outline' size={25} type='ionicon' style={{ marginRight: 10 }} />}
                                            onPress={() => navigation.navigate('Settings')} />
                                    ),
                                    headerStyle: headerStyle
                                })} />
                                <Stack.Screen name="Chat" component={ChatScreen} options={{
                                    title: 'Chat',
                                    headerShown: true,
                                    headerRight: () => (
                                        <Icon name='ellipsis-vertical-outline' type='ionicon' />
                                    ),
                                    headerStyle: headerStyle
                                }} />
                                <Stack.Screen name="Settings" component={SettingsScreen} options={{
                                    title: 'Settings',
                                    headerShown: true,
                                    headerStyle: headerStyle
                                }} />
                                <Stack.Screen name="ProfileImage" component={ProfileImageScreen} options={{
                                    title: 'Profile Picture',
                                    headerShown: true,
                                    headerStyle: headerStyle
                                }}
                                />
                            </>
                        ) :
                        (
                            <>
                                <Stack.Screen name="GetStarted" component={GetStartedScreen} />
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Verification" component={VerificationScreen} />
                                <Stack.Screen name="SignUp" component={SignupScreen} />
                            </>
                        )}
                </Stack.Navigator>
            </NavigationContainer>
        );
    };
}

const headerStyle = {
    backgroundColor: AppTheme.colors.themeColor,
    elevation: 0,
    shadowOpacity: 0
};

export default AppNavigator;