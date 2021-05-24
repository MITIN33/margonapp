import React, { Component } from 'react';
import { Button, Container } from '../components/base-components';
import OTPBox from '../components/otp-verfication';
import { Text, ToastAndroid } from 'react-native';
import { userstore } from '../stores/UserStore';

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
            <Container center>
                <Text style={{ marginBottom: 50 }}>{`Please enter the code sent to ${phoneNumber}.`}</Text>
                <OTPBox count={6} onChangeText={this.onTextChange} />
                <Button title="Verify" loading={this.state.isLoading} disabled={this.state.isDisabled} onPress={this.confirmCode} />
            </Container>
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
        userstore.validateCodeAndAddUser(this.state.code)
            .catch((error) => {
                ToastAndroid.showWithGravity(error.message, ToastAndroid.LONG, ToastAndroid.TOP);
            })
            .finally(() => {
                this.setState({ isLoading: false, isDisabled: false })
            })

    }
}

export default VerificationScreen;