import React, { Component } from 'react';
import { Container, Heading } from '../components/base-components';
import OTPBox from '../components/otp-verfication';
import { StatusBar, Text, ToastAndroid, View } from 'react-native';
import { userstore } from '../stores/UserStore';
import { Button } from 'react-native-elements';
import { Colors } from '../theme/AppTheme';
import { authStore } from '../stores/AuthStore';
import { margonAPI } from '../api/margon-server-api';

class VerificationScreen extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            code: '',
            isDisabled: true
        }
    }

    render() {

        const { phoneNumber } = this.props.route.params;
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
                <StatusBar backgroundColor={Colors.lightGrey1} />
                <Heading text='Enter the code' />
                <Text style={{ color: 'black', marginBottom: 30, textAlign: 'center' }}>{`Please enter the code sent to ${phoneNumber}.`}</Text>

                <OTPBox count={6} onChangeText={this.onTextChange} />
                <Button
                    containerStyle={{ position: 'absolute', bottom: 50 }}
                    buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.primary }}
                    title="VERIFY"
                    loading={this.state.isLoading}
                    disabled={this.state.isDisabled}
                    onPress={this.confirmCode} />
            </View>
        );
    }

    onTextChange = (code) => {
        this.setState({
            code,
            isDisabled: code.length != 6
        })
    }

    confirmCode = () => {
        this.setState({ isLoading: true, isDisabled: true })
        authStore.confirmationResult.confirm(this.state.code)
            .then((result) => {
                if (result)
                    margonAPI.Me()
                        .then((response) => {
                            userstore.setUser(response.data);
                            authStore.setUserSignedIn(true);
                        })
                        .catch((err) => {
                            if (err.response.status == 404) {
                                this.props.navigation.navigate('Profile')
                            }
                            else {
                                ToastAndroid.show('Something went wrong, please try again later', ToastAndroid.LONG)
                            }
                        })

            })
            .catch((error) => {
                ToastAndroid.showWithGravity(error.message, ToastAndroid.LONG, ToastAndroid.TOP);
            })
            .finally(() => {
                this.setState({ isLoading: false, isDisabled: false })
            })

    }
}

export default VerificationScreen;