import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Image, Alert, Keyboard } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { margonServer } from '../api/axios-instance';
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Image source={require('../assets/ms_logo.png')} width={10} resizeMode={'cover'} />
                <Input placeholder={"User Name"} onChangeText={this.onUserNameChange} />
                <Input placeholder={'Password'} secureTextEntry onChangeText={this.onPasswordChange} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <Text onPress={() => this.props.navigation.navigate("SignUp")}>Register</Text>
                    <Text>Forgot Password</Text>
                </View>
                <Button title="Login" loading={this.state.isLoading} disabled={this.state.isLoading} onPress={(ev) => this.onLoginClick(ev)} />
                <Divider text="OR" />
                <Button icon={{ name: "facebook", size: 20, color: "white" }} title="Login via Facebook" />
            </View>
        );
    }


    private onLoginClick = (ev) => {

        this.setLoading(true);
        const userLoginRequest = {
            userName: this.state.userName,
            password: this.state.password
        }

        console.log('Sending request');
        Keyboard.dismiss();
        margonServer.post('/auth/token', userLoginRequest)
            .then((response) => {
                userstore.saveTokenInfo(response.data);
                userstore.fetchUser();
            })
            .catch((err) => {
                if (err.response.status == '401') {
                    Alert.alert('Error', 'Wrong username/password entered');
                }
                else {
                    console.log(err.response.data);
                }
            })
            .finally(() => {
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