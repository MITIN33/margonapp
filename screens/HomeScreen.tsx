import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { ActivityIndicator, LogBox, Platform, RefreshControl } from 'react-native';
import { StatusBar } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Avatar, ListItem, Image, Text, Badge } from 'react-native-elements';
import { Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { margonAPI } from '../api/margon-server-api';
import { chatHubClient } from '../chats/chat-client';
import { IDialogs } from '../models/chat-models';
import { chatStore } from '../stores/ChatStore';
import { userstore } from '../stores/UserStore';

const access = () => <Icon name='ellipsis-vertical-outline' type='ionicon' />;

@observer
class HomeScreen extends Component<any, any> {

    private list: any = [];

    constructor(props) {
        super(props);
        if (Platform.OS !== 'ios')
            StatusBar.setBackgroundColor('#71afe5');
        LogBox.ignoreLogs(['Setting a timer']);
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        chatStore.loadDialogs();
    }

    // loadData = (dialogs: IDialogs[]) => {
    //     this.list = [];
    //     dialogs.map((val, key) => {
    //         this.list.push({
    //             userId: val.userId,
    //             otherUserId: val.otherUserId,
    //             dialogId: val.dialogId,
    //             name: val.name,
    //             avatar_url: val.photoUrl,
    //             short_text: val.lastMessage,
    //             time: this.getDate(val.lastMessageDateSent),
    //             unreadMessageCnt: val.unreadMessageCount
    //         });
    //     });
    // }

    // // getDate(epchTime) {
    // //     var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    // //     d.setUTCMilliseconds(epchTime);

    // //     let currentDate = Date.now()
    // //     if(Math.abs(currentDate - epchTime) > 86400000){
    // //         return d.toLocaleDateString();
    // //     }
    // //     return this.dateTOAMORPM(d);
    // // }

    // // dateTOAMORPM(currentDateTime) {
    // //     var hrs = currentDateTime.getHours();
    // //     var mnts = currentDateTime.getMinutes();
    // //     var AMPM = hrs >= 12 ? 'PM' : 'AM';
    // //     hrs = hrs % 12;
    // //     hrs = hrs ? hrs : 12;
    // //     mnts = mnts < 10 ? '0' + mnts : mnts;
    // //     var result = hrs + ':' + mnts + ' ' + AMPM;
    // //     return result;
    // //  }

    onRefresh = () => {
        chatStore.loadDialogs();
    }

    render() {

        if (chatStore.isDialogsLoading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>
        }

        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={this.onRefresh}
                    />}
            >
                <View>
                    {
                        chatStore.dialogs.map((l, i) => (
                            <ListItem key={i} bottomDivider onPress={() => {
                                this.props.navigation.navigate('Chat', l)
                            }}>
                                <Avatar source={{ uri: l.photoUrl }} rounded >
                                    {i % 4 == 0 ? <Avatar.Accessory source={require('../assets/online-image.png')} /> : null}
                                </Avatar>
                                <ListItem.Content>
                                    <ListItem.Title>{l.name}</ListItem.Title>
                                    <ListItem.Subtitle>{l.lastMessage}</ListItem.Subtitle>
                                </ListItem.Content>
                                <View style={{ justifyContent: 'flex-end' }}>
                                    {l.unreadMessageCount !== 0 ? <Badge value={l.unreadMessageCount} /> : null}
                                    <Text style={styles.ratingText}>{l.lastMessageDateSent}</Text>
                                </View>
                            </ListItem>
                        ))
                    }
                </View>
            </ ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    subtitleView: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingTop: 5
    },
    ratingImage: {
        height: 19.21,
        width: 100
    },
    ratingText: {
        fontSize: 12,
        color: 'grey',
        marginTop: 5
    }
});

export default HomeScreen;