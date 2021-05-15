import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Image, Alert, Keyboard, ImageBackground } from 'react-native';
import { IMessage } from "react-native-gifted-chat";
import { Input, Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { margonServer } from '../api/axios-instance';
import { Container, Divider } from '../components/base-components';
import { userstore } from '../stores/UserStore';
import { Avatar, ListItem, Icon, Overlay } from 'react-native-elements';
import { GestureResponderEvent } from 'react-native';
import { Switch } from 'react-native-elements';
import {
    pickImageAsync,
    takePictureAsync,
} from '../components/media-utils';

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
            isLoading: false,
            list: list,
            list2: list2,
            availibilityFlag: true,
            visible: false
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
            const currentUserPic = userstore.user.profilePicUrl;
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
            { text: "OK", onPress: userstore.Logout }
        ]);
    };

    toggleOverlay = () => {
        const { visible } = this.state;
        this.setState({ visible: !visible });
    };

    onImageUpload = (messages: IMessage[] = []) => {
       console.log(messages);
    }

    render() {
        const { availibilityFlag, visible } = this.state;
        const currentUser = userstore.user;
        const userFullName = currentUser.firstName + ' ' + (currentUser.lastName ? currentUser.lastName : '');
        return (
            <View>
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 20, marginBottom: 20, alignItems: 'center', padding: 60 }}>
                    <Avatar onPress={this.OnHandleImageClick} size={85} source={{ uri: currentUser.profilePicUrl }} rounded >
                        <Avatar.Accessory onPress={this.OnHandleEdit} size={20} source={require('../assets/edit-icon.png')} />
                    </Avatar>
                    <Text style={{ marginTop: 10, fontSize: 24 }}>{userFullName}</Text>
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
                            onPress={() => pickImageAsync(this.onImageUpload)} 
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
            </View>
        );
    }
}

export default SettingsScreen;