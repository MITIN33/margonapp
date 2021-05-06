import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from './HomeScreen';
import ChatHistory from './ChatHistory';

class TabNavigation extends Component {


    render() {
        const Tab = createMaterialTopTabNavigator();

        return (
            <Tab.Navigator lazy={true}>
                <Tab.Screen name="Online" component={HomeScreen} />
                <Tab.Screen name="Chats" component={ChatHistory} />
            </Tab.Navigator>
        );
    }
}

export default TabNavigation;