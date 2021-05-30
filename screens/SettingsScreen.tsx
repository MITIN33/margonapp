import React, { Component } from 'react';
import { Text, View, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Button } from 'react-native-elements';
import { userstore } from '../stores/UserStore';
import { Avatar, ListItem, Icon, Overlay } from 'react-native-elements';
import { GestureResponderEvent } from 'react-native';
import { Switch } from 'react-native-elements';
import {
    takePictureAsync,
    pickImageAsync,
} from '../components/media-utils';
import { ScrollView } from 'react-native-gesture-handler';
import { dialogsStore } from '../stores/DialogsStore';
import { chatStore } from '../stores/ChatStore';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { observer } from 'mobx-react';

@observer
class SettingsScreen extends Component<any, any> {

    constructor(props) {
        super(props);
        const list = [
            {
                title: 'User Name',
                Subtitle: userstore.user.userName,
                action: ''
            },
            {
                title: 'Profile',
                Subtitle: 'Edit Profile',
                action: this.OnHandlePress
            },
            {
                title: 'Availibility',
                Subtitle: 'Online',
                action: this.updateAvailibilityFlag
            },
            {
                title: 'Set a status',
                Subtitle: '',
                action: this.OnHandlePress2
            }
        ];
        const list2 = [
            {
                title: 'Sign Out',
                action: this.OnHandleSignOut
            }
        ];
        this.state = {
            loading: false,
            list: list,
            list2: list2,
            availibilityFlag: true,
            visible: false,
            imageUri: userstore.user?.photoUrl
        }
    }

    OnHandlePress = (event: GestureResponderEvent) => {
        console.log("Action 1");
    };
    OnHandlePress2 = (event: GestureResponderEvent) => {
        console.log("Action 2");
    };
    OnHandleEdit = () => {
        console.log("Edit");
        this.toggleOverlay();
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
    updateAvailibilityFlag = () => {
        try {
            const { availibilityFlag } = this.state;
            this.setState({ availibilityFlag: !availibilityFlag });
        }
        catch {

        }
    }
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

    toggleOverlay = () => {
        const { visible } = this.state;
        this.setState({ visible: !visible });
    };

    onImageUpload = () => {
        pickImageAsync(async (result) => {
            var imageUri = result.uri
            this.toggleOverlay();
            this.setState({ loading: true, imageUri })
            if (imageUri !== null) {
                var path = `profile-pics/${userstore.user.userId}.jpeg`;
                const ref = firebaseApp.storage().ref(path);
                await ref.putFile(imageUri)
                var url = await ref.getDownloadURL();
                var user = await margonAPI.updateUser({ photoUrl: url })
                userstore.setUser(user);
                this.setState({ loading: false })
            }
        })
    }

    render() {
        const { availibilityFlag, visible } = this.state;

        return (
            <ScrollView
                refreshControl={<RefreshControl refreshing={this.state.loading} />}>
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 20, marginBottom: 20, alignItems: 'center' }}>
                    <Avatar renderPlaceholderContent={<ActivityIndicator />} onPress={this.OnHandleImageClick} size={85} source={{ uri: this.state.imageUri }} rounded >
                        <Avatar.Accessory onPress={this.OnHandleEdit} size={20} source={require('../assets/edit-icon.jpg')} />
                    </Avatar>
                    <Text style={{ marginTop: 10, fontSize: 24 }}>{userstore.user?.displayName}</Text>
                </View>
                <Overlay isVisible={visible} onBackdropPress={this.toggleOverlay}>
                    <Text style={{ marginLeft: 5, fontWeight: 'bold' }}>Upload Profile Picture</Text>
                    <View style={{
                        width: '30%',
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Button
                            type='clear'
                            icon={<Icon name='image-outline' size={25} type='ionicon' style={{ marginRight: 10 }} />}
                            onPress={this.onImageUpload}
                            title='Gallery'
                        />
                        <Button
                            type='clear'
                            icon={<Icon name='camera-outline' size={25} type='ionicon' style={{ marginRight: 10 }} />}
                            title='Camera'
                            onPress={() => takePictureAsync(this.onImageUpload)}
                        />
                    </View>
                </Overlay>
                {this.state.list.map((item, i) => (
                    <ListItem key={i} bottomDivider onPress={item.action}>
                        <ListItem.Content>
                            <ListItem.Title>{item.title}</ListItem.Title>
                            <ListItem.Subtitle>{item.Subtitle}</ListItem.Subtitle>
                        </ListItem.Content>
                        {(item.title === 'Availibility') &&
                            <Switch value={availibilityFlag} color="green" onValueChange={this.updateAvailibilityFlag}></Switch>}
                    </ListItem>
                ))}
                {this.state.list2.map((item, i) => (
                    <ListItem style={{ marginTop: 20 }} key={i} bottomDivider onPress={item.action}>
                        <ListItem.Content style={{ alignItems: 'center' }}>
                            <ListItem.Title style={{ color: 'red' }}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </ScrollView>
        );
    }
}

export default SettingsScreen;