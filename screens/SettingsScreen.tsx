import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text, View, Image, Alert, Keyboard, ImageBackground } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import { margonServer } from '../api/axios-instance';
import { Divider } from '../components/base-components';
import { userstore } from '../stores/UserStore';
import { Avatar, ListItem, Icon } from 'react-native-elements';
import { GestureResponderEvent } from 'react-native';
import { Switch } from 'react-native-elements';
@observer
class SettingsScreen extends Component<any, any> {
    OnHandlePress = (event: GestureResponderEvent) => {
        console.log("Action 1");
    };
    OnHandlePress2 = (event: GestureResponderEvent) => {
        console.log("Action 2");
    };
    OnHandleEdit = () => {
        console.log("Edit");
    };
    OnHandleImageClick = () => {
        try {
            this.props.navigation.navigate('ProfileImage');
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
            availibilityFlag: true
        }
    }

    render() {
        const { availibilityFlag } = this.state;
        const currentUser = userstore.user;
        return (
            <View>
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 20, marginBottom: 20, alignItems: 'center', padding: 60 }}>
                    <Avatar onPress={this.OnHandleImageClick} size={85} source={{ uri: currentUser.profilePicUrl }} rounded >
                        <Avatar.Accessory onPress={this.OnHandleEdit} size={20} source={require('../assets/edit-icon.png')} />
                    </Avatar>
                    <Text style={{ marginTop: 10, fontSize: 24 }}>{currentUser.firstName}</Text>
                </View>
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