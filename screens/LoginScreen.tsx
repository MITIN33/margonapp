import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Alert, Keyboard } from 'react-native';
import { Input, Button } from 'react-native-elements';
// import { firebaseAuth } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { Divider, CompatibleView, TextInput } from '../components/base-components';
import { userstore } from '../stores/UserStore';

@observer
class LoginScreen extends Component<any, any> {
    code: any;
    confirmation: any;
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            password: '',
            isLoading: false,
            phoneNumber: '+91'
        }
    }

    render() {
        return (
            <CompatibleView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }} >
                {/* <Input placeholder={"User Name"} onChangeText={this.onUserNameChange} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Text onPress={() => this.props.navigation.navigate("SignUp")}>Register</Text>
                    <Text>Forgot Password</Text>
                </View>
                <Divider text="OR" />
                 
                <Button icon={{ name: "facebook", size: 20, color: "white" }} title="Login via Facebook" /> 
                */}
                < Input placeholder={"User Name"} onChangeText={this.onUserNameChange} />
                <Input placeholder={'Password'} secureTextEntry onChangeText={this.onPasswordChange} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Text onPress={() => this.props.navigation.navigate("SignUp")}>Register</Text>
                    <Text>Forgot Password</Text>
                </View>
                <Divider text="OR" />

                {/* <TextInput
                    maxLength={14}
                    keyboardType='number-pad'
                    value={this.state.phoneNumber}
                    onChangeText={this.onChangeText}
                /> */}

                <Button title="Send Code" loading={this.state.isLoading} disabled={this.state.isLoading} onPress={(ev) => this.onLoginClick(ev)} />
            </CompatibleView>

        );
    }

    
    private onChangeText = (text) => {
        if (text.length <= 3) {
            return
        }
        else
            this.setState({ phoneNumber: text })
    }

    private onLoginClick = (ev) => {

        this.setLoading(true);
        const userLoginRequest = {
            userName: this.state.userName,
            password: this.state.password,
            grantType: 0
        }

        console.log('Sending request');
        Keyboard.dismiss();
        margonAPI.Login(userLoginRequest)
            .then((response) => {
                userstore.setLoginData(response.data)
                    .finally(() => {
                        this.setLoading(false);
                    })
            })
            .catch((err) => {
                if (err.response.status == '401') {
                    Alert.alert('Error', 'Wrong username/password entered');
                }
                console.log(err.response.data);
                this.setLoading(false);
            })
    }

    confirmCode = () => {
        this.confirmation.confirm(this.code).then((result) => {
            // User signed in successfully.
            const user = result.user;
            console.log(JSON.stringify(user))
            // ...
        }).catch((error) => {
            console.error(error);
        });
    }

    sendCode = async (phoneNumber) => {
        // console.log('sending code to number')
        // const result = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
        // this.confirmation = result;
        // console.log('code sent')
    }


    private onUserNameChange = (userName) => {
        this.setState({ userName });
    }

    private onPasswordChange = (password) => {
        this.setState({ password });
    }

    private setLoading(value) {
        this.setState({ isLoading: value });
    }
}

export default LoginScreen;