import React, { Component } from 'react';
import { Container } from '../components/base-components';
import OTPBox from '../components/otp-verfication';

class VerificationScreen extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container center>
                <OTPBox count={5} onChangeText={(val) => console.log(val)} />
            </Container>
        );
    }
}

export default VerificationScreen;