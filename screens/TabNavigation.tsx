import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from './HomeScreen';
import ChatHistory from './ChatHistory';
import AppTheme from '../theme/AppTheme';
import StatusScreen from './StatusScreen';
import { userstore } from '../stores/UserStore';
import { chatHubClient } from '../chats/chat-client';
import { margonAPI } from '../api/margon-server-api';
import { Alert, ToastAndroid, View, Text } from 'react-native';
import { authStore } from '../stores/AuthStore';

class TabNavigation extends Component {


    constructor(props) {
        super(props)
    }

    componentDidMount() {
        chatHubClient.stetupConnection()
    }

    render() {

        const Tab = createMaterialTopTabNavigator();

        return (
            <>
                <Tab.Navigator initialRouteName='Chats' tabBarOptions={{ style: { backgroundColor: AppTheme.colors.themeColor } }}>
                    <Tab.Screen name="Status" component={StatusScreen} />
                    <Tab.Screen name="Online" component={ChatHistory} />
                    <Tab.Screen name="Chats" component={HomeScreen} />
                </Tab.Navigator>
            </>
        );
    }
}

export default TabNavigation;