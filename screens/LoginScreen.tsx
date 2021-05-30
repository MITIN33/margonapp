import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { StatusBar, Text } from 'react-native';
import { Button, Image } from 'react-native-elements';
import { firebaseApp } from '../api/firebase-config';
import { CompatibleView, TextInput } from '../components/base-components';
import { authStore } from '../stores/AuthStore';
import { userstore } from '../stores/UserStore';
import { Colors } from '../theme/AppTheme';

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
            <CompatibleView style={{ flex: 1, alignItems: 'center', padding: 20, backgroundColor: 'white' }} >
                <StatusBar backgroundColor={'white'} />
                {/* <Image source={require('../assets/chat-icon.png')} style={{ width: 100, height: 100, marginBottom: 50 }} /> */}
                <Text style={{ color: Colors.themeColor, fontSize: 30, fontWeight: 'bold', marginBottom: 30, marginTop: 30 }}>{"What's your number ?"}</Text>
                <Text style={{ color: 'black', marginBottom: 30, textAlign: 'center' }}>Pleas enter a valid phone number. We will send you a six digit code number to verify your account.</Text>
                <TextInput
                    maxLength={14}
                    keyboardType='number-pad'
                    value={this.state.phoneNumber}
                    onChangeText={this.onChangeText}
                />
                <Button
                    containerStyle={{ position: 'absolute', bottom: 50 }}
                    buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.themeColor }}
                    titleStyle={{ color: 'white' }}
                    title='SEND CODE'
                    loading={this.state.isLoading} disabled={this.state.isDisabled}
                    onPress={() => this.sendCode()}
                />

            </CompatibleView >

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
        this.setState({ isLoading: true, isDisabled: true })

        firebaseApp.auth().signInWithPhoneNumber(this.state.phoneNumber)
            .then((result) => {
                authStore.confirmationResult = result;
                this.props.navigation.navigate('Verification', this.state.phoneNumber);
                console.log('code sent')
            })
            .finally(() => this.setState({ isLoading: false, isDisabled: true }))
    }
}

export default LoginScreen;