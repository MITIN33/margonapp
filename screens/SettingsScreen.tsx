import React, { Component } from 'react';
import { View, Alert, ActivityIndicator, RefreshControl, StyleSheet, Animated } from 'react-native';
import { userstore } from '../stores/UserStore';
import { Button, Text, Avatar, Icon, Overlay, BottomSheet, ListItem } from 'react-native-elements';
import { GestureResponderEvent } from 'react-native';
import { Switch } from 'react-native-elements';
import {
    takePictureAsync,
    pickImageAsync,
} from '../components/media-utils';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { dialogsStore } from '../stores/DialogsStore';
import { chatStore } from '../stores/ChatStore';
import { firebaseApp } from '../api/firebase-config';
import { margonAPI } from '../api/margon-server-api';
import { observer } from 'mobx-react';
import MgList from '../components/mg-list-item';
import { Colors } from '../theme/AppTheme';
import { TextInput } from '../components/base-components';
import { Slider } from 'react-native-elements/dist/slider/Slider';
import { values } from 'mobx';

@observer
class SettingsScreen extends Component<any, any> {

    constructor(props) {
        super(props);

        const list = [
            {
                title: 'Phone Number',
                Subtitle: () => userstore.user.phoneNumber,
                action: ''
            },
            {
                title: 'Distance (km)',
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
            distanceOverlayVisible: false,
        }
    }

    renderRightWidget = () => {
        return <Switch value={this.state.availibilityFlag} onValueChange={this.updateAvailibilityFlag} />
    }

    toggleDistanceOverLay = () => {
        this.setState({ distanceOverlayVisible: !this.state.distanceOverlayVisible })
    };


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


    renderBottomSheet = () => {
        const list = [
            {
                title: 'Camera',
                icon: 'camera',
                action: this.onImageUpload
            },
            {
                title: 'Gallery',
                icon: 'image',
                action: this.onImageUpload
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
        const { user } = userstore;

        return (
            <Overlay overlayStyle={styles.overlayStyle} statusBarTranslucent isVisible={this.state.distanceOverlayVisible} onBackdropPress={this.toggleDistanceOverLay}>
                <Text style={styles.overlayTitleStyle}>{`Reach ${this.state.distance} (in km)`}</Text>
                <Slider
                    thumbStyle={{ height: 40, width: 40, backgroundColor: 'transparent' }}
                    thumbProps={{
                        Component: Animated.Image,
                        source: {
                            uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                        },
                    }}
                    value={this.state.distance} step={1} onValueChange={this.updateDistance} maximumValue={50} minimumValue={10} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Button type='clear' containerStyle={{ width: 60 }} title='Done' onPress={this.toggleDistanceOverLay} />
                </View>
            </Overlay>
        )

    }


    updateDistance = (value) => {
        this.setState({ distance: value });
    }


    updateAvailibilityFlag = () => {
        const { availibilityFlag } = this.state;
        this.setState({ availibilityFlag: !availibilityFlag })
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

    toggleImageChangeOverlay = () => {
        const { visible } = this.state;
        this.setState({ visible: !visible });
    };

    onImageUpload = () => {
        pickImageAsync(async (result) => {
            this.toggleImageChangeOverlay();
            if (!result.didCancel) {
                var imageUri = result.uri
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
            }
        })
    }

    toggleEditBox = () => {
        this.setState({ editableBoxVisible: !this.state.editableBoxVisible })
    }

    onDisplayNameChange = (text) => {
        this.setState({ displayName: text })
    }

    saveDisplayName = () => {
        this.toggleEditBox();
    }

    renderEditTextBox = () => (
        <Overlay overlayStyle={styles.overlayStyle} isVisible={this.state.editableBoxVisible} onBackdropPress={this.toggleEditBox}>
            <Text style={styles.overlayTitleStyle}>Edit Display Name</Text>
            <TextInput value={this.state.displayName} onChangeText={this.onDisplayNameChange} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button type='clear' containerStyle={{ width: 80 }} title='Cancel' onPress={this.toggleEditBox} />
                <Button type='clear' containerStyle={{ width: 60 }} title='Done' onPress={this.saveDisplayName} />
            </View>
        </Overlay>
    );

    saveProfileData = () => {
        var user = {
            displayName: this.state.displayName,
            imageUri: this.state.imageUri
        }
    }


    componentDidMount() {
        const { user } = userstore;
        this.setState({
            imageUri: userstore.user?.photoUrl,
            availibilityFlag: user.isDiscoverable,
            distance: user.maxRangeInMeter,
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
                refreshControl={<RefreshControl refreshing={this.state.loading} />}>
                <View style={styles.profileViewStyle}>
                    <Avatar renderPlaceholderContent={<ActivityIndicator />} onPress={this.OnHandleImageClick} size={70} source={{ uri: this.state.imageUri }} rounded >
                        <Avatar.Accessory onPress={this.onImageChangeClick} size={15} source={require('../assets/edit-icon.jpg')} />
                    </Avatar>
                    <View style={{ flex: 1, flexDirection: 'column', margin: 20 }} >
                        <Text style={{ color: 'grey', fontSize: 12 }}>Display Name</Text>
                        <Text style={{ fontSize: 24 }} onPress={this.toggleEditBox}>{userstore.user?.displayName}</Text>

                        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name='edit' style={{ marginLeft: 5 }} type='material' size={15} />
                        </View> */}
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