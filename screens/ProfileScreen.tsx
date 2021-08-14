import React, { Component } from "react";
import { StatusBar, ToastAndroid, View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { Avatar, Button, ButtonGroup } from "react-native-elements";
import { firebaseApp } from "../api/firebase-config";
import { CompatibleView, TextInput, Title } from "../components/base-components";
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
            <CompatibleView style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: 'white' }}>
                <StatusBar backgroundColor={'white'} />
                <View style={{ flex: 1, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Avatar size={150} containerStyle={{ margin: 20 }} source={{ uri: this.state.imageUri }} rounded onPress={this.selectImage} />
                        <TextInput placeholder='Display Name' value={this.state.displayName} onChangeText={this.onChangeUserName} />
                        <TextInput placeholder='Bio (120 words)' multiline numberOfLines={2} />

                        <ButtonGroup
                            onPress={this.updateIndex}
                            selectedIndex={this.state.selectedIndex}
                            buttons={buttons}
                            containerStyle={{ height: 40 }}
                        />
                    </View>
                    <View>
                        <Button
                            containerStyle={{ marginTop: 20, height: 50 }}
                            buttonStyle={{ height: 50, borderRadius: 10, backgroundColor: Colors.primary }}
                            title="CREATE"
                            loading={this.state.loading}
                            disabled={this.state.disabled}
                            onPress={this.createAccount}
                        />
                    </View>
                </View>
            </CompatibleView>
        );
    }

    updateIndex = (selectedIndex) => {
        this.setState({ selectedIndex })
    }

    selectImage = () => {
        pickImageAsync((result) => {
            if (!result.didCancel) {
                var imageUri = result.uri
                this.setState({ imageUri })
            }
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
                    .finally(() => { this.setState({ isLoading: false, disabled: false }) })
            })
            .finally(() => { this.setState({ isLoading: false, disabled: false }) });
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



const styles = StyleSheet.create({
    profileViewStyle: {
        marginTop: 10,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingLeft: 15
    }
})

