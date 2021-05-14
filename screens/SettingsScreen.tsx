import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Image, Alert, Keyboard, ImageBackground } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { margonServer } from '../api/axios-instance';
import { Divider } from '../components/base-components';
import { userstore } from '../stores/UserStore';

@observer
class SettingsScreen extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            password: '',
            isLoading: false
        }
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent:'space-around', alignItems: 'center', flexDirection: 'column', padding: 20, backgroundColor: '#e3dfdf' }}>
               <Button title="Sign Out" onPress={userstore.Logout} />
            </View>
        );
    }
}

export default SettingsScreen;