import axios from "react-native-axios";
import React, { Component } from 'react';
import { Text } from 'react-native-paper';
import { Button, Container, TextInput } from '../components/base-components';
import { margonServer } from "../api/axios-instance";
import { Keyboard } from "react-native";

class SignupScreen extends Component<any, any>{

    constructor(props) {
        super(props);

        this.state = {
            userName: '',
            firstName: '',
            lastName: '',
            isLoading: false
        }
    }

    render() {

        const makeAPICall = () => {
            this.setState({ isLoading: true });
            const user = {
                userName: this.state.userName,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                password: 'password'
            }
            margonServer.post('/auth/signup', user)
                .then((res) => console.log(res.data))
                .catch(err => {
                    if (err.response) {
                        // client received an error response (5xx, 4xx)
                        console.log('response error=' + JSON.stringify(err.response))
                    }
                })
                .finally(() => {
                    this.setState({ isLoading: false });
                    this.props.navigation.goBack();
                })
        }

        return (
            <Container center>
                <TextInput label="UserName" mode="outlined" onChangeText={this.setUserName} />
                <TextInput label="FirstName" mode="outlined" onChangeText={this.setFirstName} />
                <TextInput label="LastName" mode="outlined" onChangeText={this.setLastName} />
                <Button title="Sign Up" loading={this.state.isLoading} disabled={this.state.isLoading} mode="contained" onPress={makeAPICall} />
            </Container >
        );
    };

    private setUserName = (text) => {
        this.setState({ userName: text });
    }
    private setFirstName = (text) => {
        this.setState({ firstName: text });
    }
    private setLastName = (text) => {
        this.setState({ lastName: text });
    }
}

export default SignupScreen;