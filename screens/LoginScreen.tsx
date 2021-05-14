import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Image, Alert, Keyboard, ImageBackground } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { margonServer } from '../api/axios-instance';
import { margonAPI } from '../api/margon-server-api';
import { Divider } from '../components/base-components';
import { userstore } from '../stores/UserStore';

@observer
class LoginScreen extends Component<any, any> {
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
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                {/* <Input placeholder={"User Name"} onChangeText={this.onUserNameChange} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Text onPress={() => this.props.navigation.navigate("SignUp")}>Register</Text>
                    <Text>Forgot Password</Text>
                </View>
                <Divider text="OR" />
                 
                <Button icon={{ name: "facebook", size: 20, color: "white" }} title="Login via Facebook" /> 
                */}
                <Input placeholder={"User Name"} onChangeText={this.onUserNameChange} />
                <Input placeholder={'Password'} secureTextEntry onChangeText={this.onPasswordChange} />
                <Button title="Login" loading={this.state.isLoading} disabled={this.state.isLoading} onPress={(ev) => this.onLoginClick(ev)} />
            </View>
        );
    }

    private onLoginClick = (ev) => {

        this.setLoading(true);
        const userLoginRequest = {
            userName: this.state.userName,
            password: this.state.password,
            grantType: 1
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
                else {
                    console.log(err.response.data);
                }
            })
            .catch(() => {
                this.setLoading(false);
            })

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