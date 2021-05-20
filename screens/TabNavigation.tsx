import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ChatHistoryScreen from './ChatHistoryScreen';
import OnlineUsersScreen from './OnlineUsersScreen';
import AppTheme from '../theme/AppTheme';
import StatusScreen from './StatusScreen';
import { chatHubStore } from '../chats/chat-client';

class TabNavigation extends Component {


    constructor(props) {
        super(props)
    }

    componentDidMount(){
        chatHubStore.connect();
    }

    render() {

        const Tab = createMaterialTopTabNavigator();

        return (
            <>
                <Tab.Navigator initialRouteName='Chats' tabBarOptions={{ style: { backgroundColor: AppTheme.colors.themeColor } }}>
                    <Tab.Screen name="Chats" component={ChatHistoryScreen} />
                    <Tab.Screen name="Online" component={OnlineUsersScreen} />
                </Tab.Navigator>
            </>
        );
    }
}

export default TabNavigation;