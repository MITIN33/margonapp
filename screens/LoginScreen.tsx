import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { View, Image, Alert, Keyboard } from 'react-native';
import { Text, Button as PaperButton } from 'react-native-paper';
import { margonServer } from '../api/axios-instance';
import { Button, Divider, TextInput } from '../components/base-components';
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
                <Image source={require('../assets/ms_logo.png')} width={30} />
                <TextInput label="UserName" onChangeText={this.onUserNameChange} mode="outlined" />
                <TextInput label="Password" secureTextEntry onChangeText={this.onPasswordChange} mode="outlined" />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingTop: 10 }}>
                    <Text onPress={() => this.props.navigation.navigate("SignUp")}>Register</Text>
                    <Text>Forgot Password</Text>
                </View>

                <Button title="Login" loading={this.state.isLoading} disabled={this.state.isLoading} onPress={(ev) => this.onLoginClick(ev)} mode={"contained"} />
                <Divider text="OR" />
                <Button icon="facebook" mode={"contained"} title="Login via Facebook" />
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
                userstore.saveUserData(response.data);
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