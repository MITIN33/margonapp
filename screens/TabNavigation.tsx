import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ChatHistoryScreen from './ChatHistoryScreen';
import OnlineUsersScreen from './OnlineUsersScreen';
import AppTheme, { Colors } from '../theme/AppTheme';
import { chatHubStore } from '../chats/chat-client';
import { AppState } from 'react-native';
import { userstore } from '../stores/UserStore';
import { appSettings } from '../stores/AppStore';
import { observer } from 'mobx-react';

class TabNavigation extends Component<any, any> {


    constructor(props) {
        super(props)
        this.state = {
            appState: AppState.currentState,
        }
    }

    componentDidMount() {
        chatHubStore.connect();
    }

    render() {

        const Tab = createMaterialTopTabNavigator();

        return (
            <>
                <Tab.Navigator initialRouteName='Chats' tabBarOptions={{ style: { backgroundColor: Colors.themeColor } }}>
                    <Tab.Screen name="Chats" component={ChatHistoryScreen} />
                    <Tab.Screen name="Online" component={OnlineUsersScreen} />
                </Tab.Navigator>
            </>
        );
    }
}

export default TabNavigation;