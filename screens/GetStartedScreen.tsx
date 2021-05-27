import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { Button, Text, withTheme } from 'react-native-elements';
import { Colors } from '../theme/AppTheme';

@observer
class GetStartedScreen extends Component<any, any> {
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: 20, backgroundColor: Colors.primary }}>
                <StatusBar backgroundColor={Colors.primary} />
                {/* <Image source={require('../assets/chat-icon.png')} style={{ width: 100, height: 100, marginBottom: 20 }} /> */}

                <Text style={{ fontSize: 40, color: 'white', fontFamily: 'lucida grande' }}>margon</Text>
                <Button
                    containerStyle={{ position: 'absolute', bottom: 50 }}
                    buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.lightGrey1 }}
                    titleStyle={{ color: Colors.primary }}
                    title="Get Started"
                    onPress={() => this.props.navigation.navigate('Login')} />
            </View>
        );
    }
}

export default GetStartedScreen;