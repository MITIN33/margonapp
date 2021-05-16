import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-elements';

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
            <View style={{ flex: 1, justifyContent:'space-around', alignItems: 'center', flexDirection: 'column', padding: 20, backgroundColor: '#e3dfdf' }}>
                <Image source={require('../assets/chat-icon.png')} style={{ width: 100, height: 100 }} />
                <Button title="Get Started" onPress={() => this.props.navigation.navigate('Login')} />
            </View>
        );
    }
}

export default GetStartedScreen;