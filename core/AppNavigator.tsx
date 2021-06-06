import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { observer } from "mobx-react";
import React, { Component } from "react";
import LoginScreen from "../screens/LoginScreen";
import { userstore } from "../stores/UserStore";
import TabNavigation from "../screens/TabNavigation";
import SettingsScreen from "../screens/SettingsScreen";
import { View, Text, ToastAndroid } from "react-native";
import ChatScreen from "../screens/ChatScreen";
import { ActivityIndicator } from "react-native";
import { Colors } from "../theme/AppTheme";
import { Avatar, Icon } from "react-native-elements";
import GetStartedScreen from "../screens/GetStartedScreen";
import VerificationScreen from "../screens/VerificationScreen";
import { authStore } from "../stores/AuthStore";
import { Button } from 'react-native-elements';
import ProfileImageScreen from "../screens/ProfileImageScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { firebaseApp } from "../api/firebase-config";
import NetInfo from "@react-native-community/netinfo";
import { appSettings } from "../stores/AppStore";

const Stack = createStackNavigator();

@observer
class AppNavigator extends Component<any, any> {

    netSubscribe;

    constructor(props) {
        super(props);
        NetInfo.addEventListener
        this.state = {
            isLoading: true,
        }
    }


    componentDidMount() {
        this.setState({ isLoading: true })

        this.netSubscribe = NetInfo.addEventListener(state => {
            appSettings.setIsconnected(state.isConnected);
        });

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                firebaseApp.auth().onAuthStateChanged((user) => {
                    userstore.loadUser(user)
                        .finally(() => this.setState({ isLoading: false }));
                });
            }
            else {
                userstore.loadUser(null)
                    .finally(() => this.setState({ isLoading: false }));
            }
        });

    }


    componentWillUnmount() {
        this.netSubscribe();
    }

    header = (navigation) => {
        const firstName = userstore.user?.displayName;
        const photoUrl = userstore.user?.photoUrl;

        return <View style={{ flex: 1, flexDirection: 'row' }}>
            <Avatar source={{ uri: photoUrl }} containerStyle={{ paddingLeft: 15, width: 50 }} rounded ></Avatar>
            <Text>{firstName}</Text>
            <Button
                type='clear'
                icon={<Icon name='options-outline' size={25} type='ionicon' style={{ marginRight: 10 }} />}
                onPress={() => navigation.navigate('Settings')} />
        </View>
    }

    render() {
        if (this.state.isLoading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>
        }
        const firstName = userstore.user?.displayName;
        const photoUrl = userstore.user?.photoUrl;

        return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {authStore.isUserSigned ?
                        (
                            <>
                                <Stack.Screen name="Home" component={TabNavigation} options={({ navigation }) => ({
                                    headerShown: true,
                                    headerTitle: firstName,
                                    headerLeft: () => (
                                        <Avatar source={{ uri: photoUrl }} containerStyle={{ paddingLeft: 15, width: 50 }} rounded ></Avatar>
                                    ),
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
                                <Stack.Screen name="Profile" component={ProfileScreen} />
                            </>
                        )}
                </Stack.Navigator>
            </NavigationContainer>
        );
    };
}

const headerStyle = {
    backgroundColor: Colors.themeColor,
    elevation: 0,
    shadowOpacity: 0
};

export default AppNavigator;