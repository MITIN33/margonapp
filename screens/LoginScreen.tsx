import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button, Image } from 'react-native-elements';
import { firebaseApp } from '../api/firebase-config';
import { CompatibleView, TextInput } from '../components/base-components';
import { authStore } from '../stores/AuthStore';

@observer
class LoginScreen extends Component<any, any> {

    confirmation: any;
    constructor(props) {
        super(props);
        this.state = {
            isDisabled: true,
            isLoading: false,
            phoneNumber: '+91 ',
            code: ''
        }
    }

    render() {
        return (
            <CompatibleView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }} >
                <Image source={require('../assets/chat-icon.png')} style={{ width: 100, height: 100, marginBottom: 50 }} />
                <TextInput
                    maxLength={14}
                    keyboardType='number-pad'
                    value={this.state.phoneNumber}
                    onChangeText={this.onChangeText}
                />
                <Button title="Send Code" loading={this.state.isLoading} disabled={this.state.isDisabled} onPress={() => this.sendCode()} />
            </CompatibleView>

        );
    }


    private onChangeText = (text) => {
        if (text.length <= 3) {
            return
        }
        this.setState({ phoneNumber: text, isDisabled: text.length != 14 })
    }

    sendCode = () => {
        console.log('sending code to number')
        this.setState({ isLoading: true })
        firebaseApp.auth().signInWithPhoneNumber(this.state.phoneNumber)
            .then((result) => {
                authStore.confirmationResult = result;
                this.props.navigation.navigate('Verification', this.state.phoneNumber);
                console.log('code sent')
            })
            .finally(() => this.setState({ isLoading: false }))
    }
}

export default LoginScreen;