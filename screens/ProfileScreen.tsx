import React, { Component } from "react";
import { StatusBar, Text, View } from "react-native";
import { Avatar, Button, Chip } from "react-native-elements";
import { firebaseApp } from "../api/firebase-config";
import { margonAPI } from "../api/margon-server-api";
import { Heading, TextInput, Title } from "../components/base-components";
import { clientConstants } from "../models/constants";
import { userstore } from "../stores/UserStore";
import { Colors } from "../theme/AppTheme";

class ProfileScreen extends Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            displayName: '',
            imageUri: clientConstants.DEFAULT_IMAGE_URL
        }
    }


    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
                <StatusBar backgroundColor={'white'} />
                <Heading text='Lets Build Your Profile' />
                <Avatar size={180} source={{ uri: this.state.imageUri }} rounded />
                <Title text='DISPLAY NAME' />
                <TextInput value={this.state.displayName} onChangeText={this.onChangeUserName} />

                <Button
                    containerStyle={{ position: 'absolute', bottom: 50 }}
                    buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.primary }}
                    title="CREATE"
                    loading={this.state.loading}
                    disabled={this.state.loading}
                    onPress={this.createAccount}
                />

            </View>
        );
    }

    onChangeUserName = (text) => {
        this.setState({ displayName: text })
    }

    private createAccount = () => {
        this.setState({ loading: true })
        var firebaseUser = firebaseApp.auth().currentUser;
        const user = {
            displayName: this.state.displayName,
            photoUrl: this.state.imageUri ?? clientConstants.DEFAULT_IMAGE_URL,
            phoneNumber: firebaseUser.phoneNumber,
            userId: firebaseUser.uid,
            settings: {
                maxRangeInMeteres: 50000
            }
        }
        userstore.addUser(user).then(() => {
            this.setState({ loading: false })
        })
    }
}


export default ProfileScreen;


