import React, { Component } from 'react';
import { View, Alert, ActivityIndicator, RefreshControl, StyleSheet, ToastAndroid } from 'react-native';
import { userstore } from '../stores/UserStore';
import { Button, Text, Avatar, Icon, Overlay, BottomSheet, ListItem } from 'react-native-elements';
import { Switch } from 'react-native-elements';
import {
    pickImageAsync,
} from '../components/media-utils';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { dialogsStore } from '../stores/DialogsStore';
import { chatStore } from '../stores/ChatStore';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { observer } from 'mobx-react';
import MgList from '../components/mg-list-item';
import { TextInput } from '../components/base-components';
import { Slider } from 'react-native-elements/dist/slider/Slider';
import { ISettingsState, IUser } from '../models/chat-models';

@observer
class SettingsScreen extends Component<any, ISettingsState> {

    constructor(props) {
        super(props);

        const list = [
            {
                title: 'Phone Number',
                Subtitle: () => userstore.user?.phoneNumber
            },
            {
                title: 'Reach (km)',
                Subtitle: () => this.state.distance,
                action: this.toggleDistanceOverLay
            },
            {
                title: 'Discoverable',
                Subtitle: () => (this.state && this.state.availibilityFlag) ? 'All' : 'None',
                renderRightWidget: this.renderRightWidget
            }
        ];

        this.state = {
            list: list,
            loading: false,
            visible: false,
            editableBoxVisible: false,
            distanceOverlayVisible: false
        }
    }

    renderRightWidget = () => {
        return <Switch value={this.state.availibilityFlag} onValueChange={() => this.setState({ availibilityFlag: !this.state.availibilityFlag })} />
    }

    renderEditTextBox = () => (
        <Overlay overlayStyle={styles.overlayStyle} isVisible={this.state.editableBoxVisible} onBackdropPress={this.toggleEditBox}>
            <Text style={styles.overlayTitleStyle}>Edit Display Name</Text>
            <TextInput value={this.state.displayName} onChangeText={(text) => this.setState({ displayName: text })} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button type='clear' containerStyle={{ width: 60 }} title='Done' onPress={this.toggleEditBox} />
            </View>
        </Overlay>
    );

    renderBottomSheet = () => {
        const list = [
            {
                title: 'Camera',
                icon: 'camera',
                action: () => pickImageAsync(this.onImageUpload)
            },
            {
                title: 'Gallery',
                icon: 'image',
                action: () => pickImageAsync(this.onImageUpload)
            }
        ];

        return (
            <BottomSheet
                modalProps={{ animationType: 'fade', onRequestClose: this.toggleImageChangeOverlay, statusBarTranslucent: true }}
                isVisible={this.state.visible}
                containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}
            >
                <TouchableWithoutFeedback onPressOut={this.toggleImageChangeOverlay}>
                    {list.map((item, i) => (
                        <ListItem key={i}
                            onPress={item.action}>
                            <Icon name={item.icon} type='material' />
                            <ListItem.Content>
                                <ListItem.Title>{item.title}</ListItem.Title>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </TouchableWithoutFeedback>
            </BottomSheet>
        )
    }

    renderDistanceOverLay = () => {
        return (
            <Overlay overlayStyle={styles.overlayStyle} statusBarTranslucent isVisible={this.state.distanceOverlayVisible} onBackdropPress={this.toggleDistanceOverLay}>
                <Text style={styles.overlayTitleStyle}>{`Reach ${this.state.distance} (in km)`}</Text>
                <Slider
                    thumbStyle={{ height: 40, width: 40, backgroundColor: 'transparent' }}
                    value={this.state.distance} step={1} onValueChange={(value) => this.setState({ distance: value })} maximumValue={50} minimumValue={10} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Button type='clear' containerStyle={{ width: 60 }} title='Done' onPress={this.toggleDistanceOverLay} />
                </View>
            </Overlay>
        )
    }

    onRefreshSettings = () => {
        this.setState({ loading: true })
        userstore.refreshUser()
            .then(user => {
                console.log(JSON.stringify(user))
                this.setState({
                    imageUri: userstore.user?.photoUrl,
                    availibilityFlag: user.isDiscoverable == 1 ? true : false,
                    distance: user.maxRangeInKm,
                    displayName: user.displayName
                });
            })
            .finally(() => this.setState({ loading: false }))
    }

    toggleDistanceOverLay = () => {
        this.setState({ distanceOverlayVisible: !this.state.distanceOverlayVisible })
    };

    toggleImageChangeOverlay = () => {
        this.setState({ visible: !this.state.visible });
    };

    toggleEditBox = () => {
        this.setState({ editableBoxVisible: !this.state.editableBoxVisible })
    }

    saveProfileData = async () => {
        let user: IUser = {};
        let isUserUpdated = false;
        if (userstore.user.displayName !== this.state.displayName) {
            user.displayName = this.state.displayName;
            isUserUpdated = true;
        }
        let flag = userstore.user.isDiscoverable == 1 ? true : false;
        if (flag !== this.state.availibilityFlag) {
            user.isDiscoverable = this.state.availibilityFlag ? 1 : 2
            isUserUpdated = true;
        }
        if (userstore.user.maxRangeInKm !== this.state.distance) {
            user.maxRangeInKm = this.state.distance;
            isUserUpdated = true;
        }
        if (userstore.user.photoUrl !== this.state.imageUri) {
            var path = `profile-pics/${userstore.user.userId}.jpeg`;
            try {
                const ref = firebaseApp.storage().ref(path);
                await ref.putFile(user.photoUrl)
                var url = await ref.getDownloadURL();
                user.photoUrl = url;
                isUserUpdated = true;
            } catch { }
        }

        if (isUserUpdated) {
            this.setState({ loading: true })
            userstore.updateUser(user)
                .catch(() => ToastAndroid.show('Something went wrong, please try again', ToastAndroid.SHORT))
                .finally(() => this.setState({ loading: false }))
        }
        else {
            console.log('No prop chagned for user');
        }
    }


    componentDidMount() {
        const { user } = userstore;
        this.setState({
            imageUri: userstore.user?.photoUrl,
            availibilityFlag: user.isDiscoverable == 1 ? true : false,
            distance: user.maxRangeInKm,
            displayName: user.displayName
        });
        this.props.navigation.setOptions({
            headerRight: () => (
                <Icon iconStyle={{ marginRight: 15 }} type='material' name='done' onPress={this.saveProfileData} />
            ),
        })
    }

    render() {

        return (
            <ScrollView
                refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefreshSettings} />}>
                <View style={styles.profileViewStyle}>
                    <Avatar renderPlaceholderContent={<ActivityIndicator />} onPress={this.OnHandleImageClick} size={70} source={{ uri: this.state.imageUri }} rounded >
                        <Avatar.Accessory onPress={this.onImageChangeClick} size={15} source={require('../assets/edit-icon.jpg')} />
                    </Avatar>
                    <View style={{ flex: 1, flexDirection: 'column', margin: 20 }} >
                        <Text style={{ color: 'grey', fontSize: 12 }}>Display Name</Text>
                        <Text style={{ fontSize: 24 }} onPress={this.toggleEditBox}>{this.state.displayName}</Text>
                    </View>

                </View>
                {this.renderBottomSheet()}
                {this.renderDistanceOverLay()}
                <MgList title={'Profile'} listItems={this.state.list} />
                <Button TouchableComponent={TouchableWithoutFeedback} titleStyle={{ color: 'red', fontWeight: '100' }} containerStyle={{ height: 50, marginTop: 30 }} buttonStyle={{ height: 50, backgroundColor: 'white' }} title='Sign Out' onPress={this.OnHandleSignOut} />
                {this.renderEditTextBox()}
            </ScrollView>
        );
    }


    // component events 

    OnHandleSignOut = () => {
        Alert.alert("Sign Out", 'Are you sure you want to sign out?', [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed")
            },
            {
                text: "OK", onPress: () => {
                    dialogsStore.setDialogList([]);
                    chatStore.setDialogMessages([]);
                    userstore.Logout()
                }

            }
        ]);
    };

    onImageUpload = async (result) => {
        this.toggleImageChangeOverlay();
        if (!result.didCancel) {
            var imageUri = result.uri
            this.setState({ imageUri: imageUri })
        }
    }

    onImageChangeClick = () => {
        this.toggleImageChangeOverlay();
    };
    OnHandleImageClick = () => {
        try {
            const currentUserPic = userstore.user.photoUrl;
            this.props.navigation.navigate('ProfileImage', currentUserPic);
        }
        catch (ex) {
            // logging
        }
    }
}


const styles = StyleSheet.create({
    overlayStyle: {
        width: '80%',
        borderRadius: 5
    },
    overlayTitleStyle: {
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        fontSize: 20,
        marginBottom: 20,
        marginLeft: 10
    },
    profileViewStyle: {
        marginTop: 10,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 15
    }
})

export default SettingsScreen;