import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from './HomeScreen';
import ChatHistory from './ChatHistory';
import AppTheme from '../theme/AppTheme';
import StatusScreen from './StatusScreen';

class TabNavigation extends Component {


    constructor(props) {
        super(props)
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