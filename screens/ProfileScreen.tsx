import React, { Component } from "react";
import { StatusBar, ToastAndroid, View } from "react-native";
import { Avatar, Button, ButtonGroup } from "react-native-elements";
import { firebaseApp } from "../api/firebase-config";
import { Heading, TextInput, Title } from "../components/base-components";
import { pickImageAsync } from "../components/media-utils";
import { clientConstants } from "../models/constants";
import { userstore } from "../stores/UserStore";
import { Colors } from "../theme/AppTheme";
import DatePicker from 'react-native-date-picker'

class ProfileScreen extends Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            disabled: true,
            displayName: '',
            selectedIndex: 0,
            imageUri: clientConstants.DEFAULT_IMAGE_URL,
            date: new Date()
        }
    }


    render() {
        const buttons = ['MALE', 'FEMALE', 'OTHERS']
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
                <StatusBar backgroundColor={'white'} />
                <Heading text='Lets Build Your Profile' />
                <Avatar size={150} source={{ uri: this.state.imageUri }} rounded onPress={this.selectImage} />

                <Title text='DISPLAY NAME' />
                <TextInput value={this.state.displayName} onChangeText={this.onChangeUserName} />

                <Title text='DATE OF BIRTH' />
                <DatePicker
                    date={this.state.date}
                    mode='date'
                    onDateChange={(date)=>{console.log(date)}}
                />
                <Title text='GENDER' />
                <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{ height: 50 }}
                />
                <Button
                    containerStyle={{ marginTop: 30 }}
                    buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.themeColor }}
                    title="CREATE"
                    loading={this.state.loading}
                    disabled={this.state.disabled}
                    onPress={this.createAccount}
                />
            </View>
        );
    }

    updateIndex = (selectedIndex) => {
        this.setState({ selectedIndex })
    }

    selectImage = () => {
        pickImageAsync((result) => {
            var imageUri = result.uri
            this.setState({ imageUri })
        })
    }

    onChangeUserName = (text) => {
        this.setState({ displayName: text, disabled: text.length < 5 })
    }

    private createAccount = () => {
        this.setState({ loading: true })
        var firebaseUser = firebaseApp.auth().currentUser;
        this.uploadImage(firebaseUser.uid)
            .then((imageUri) => {
                const user = {
                    displayName: this.state.displayName,
                    photoUrl: imageUri,
                    phoneNumber: firebaseUser.phoneNumber,
                    userId: firebaseUser.uid,
                    settings: {
                        maxRangeInMeteres: 10000
                    }
                }
                userstore.addUser(user).then(() => {
                    this.setState({ loading: false })
                })
                    .catch(() => { ToastAndroid.show('Something went wrong, please try again later', ToastAndroid.LONG) })
            });
    }

    private async uploadImage(uid) {
        if (this.state.imageUri !== null && this.state.imageUri !== clientConstants.DEFAULT_IMAGE_URL) {
            var path = `profile-pics/${uid}.jpeg`;
            console.log('path: ' + this.state.imageUri)
            const ref = firebaseApp.storage().ref(path);
            await ref.putFile(this.state.imageUri)
            var url = await ref.getDownloadURL();
            return url;
        }
        return clientConstants.DEFAULT_IMAGE_URL
    }
}


export default ProfileScreen;


