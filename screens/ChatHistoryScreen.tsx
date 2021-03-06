import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Alert, LogBox, Platform, RefreshControl, ToastAndroid } from 'react-native';
import { StatusBar } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Avatar, ListItem, Text, Badge } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { margonAPI } from '../api/margon-server-api';
import { chatStore } from '../stores/ChatStore';
import { dialogsStore } from '../stores/DialogsStore';
import { Colors } from '../theme/AppTheme';

@observer
class ChatHistoryScreen extends Component<any, any> {

    private list: any = [];
    _isMounted: boolean;

    constructor(props) {
        super(props);
        if (Platform.OS !== 'web')
            LogBox.ignoreLogs(['Setting a timer']);
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        dialogsStore.loadDialogs();
    }

    onRefresh = () => {
        dialogsStore.loadDialogs();
    }

    timeBasedsort(a, b) {
        return b.lastMessageDateSent - a.lastMessageDateSent;
    }

    render() {

        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={dialogsStore.isDialogLoading}
                        onRefresh={this.onRefresh}
                    />}
            >
                <StatusBar backgroundColor={Colors.themeColor} />
                <View>
                    {
                        dialogsStore.dialogs.slice().sort(this.timeBasedsort).map((dialog, i) => (
                            <ListItem key={i} bottomDivider
                                onPress={() => {
                                    this.props.navigation.navigate('Chat', dialog)
                                }}>
                                <Avatar source={{ uri: dialog.photoUrl }} rounded onPress={() => {
                                    this.props.navigation.navigate('ProfileImage', dialog.photoUrl)
                                }}>
                                    {(dialog.isUserOnline && dialog.blockedByUserIds && dialog.blockedByUserIds.length == 0) ? <Avatar.Accessory source={require('../assets/online-image.png')} /> : null}
                                </Avatar>
                                <ListItem.Content>
                                    <ListItem.Title>{dialog.name}</ListItem.Title>
                                    <ListItem.Subtitle>{dialog.isUserTyping ? 'typing...' : dialog.lastMessage}</ListItem.Subtitle>
                                </ListItem.Content>
                                <View style={{ justifyContent: 'flex-end' }}>
                                    {dialog.unreadMessageCount !== 0 ? <Badge value={dialog.unreadMessageCount} /> : null}
                                    <Text style={styles.ratingText}>{dialog.lastMessageDateSent !== 0 ? this.getDate(dialog.lastMessageDateSent) : ''}</Text>
                                </View>
                            </ListItem>
                        ))
                    }
                </View>
            </ ScrollView>

        );
    }

    private getDate(epchTime) {
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCMilliseconds(epchTime);

        let currentDate = Date.now()
        if (Math.abs(currentDate - epchTime) > 86400000) {
            return d.toLocaleDateString();
        }
        return this.dateTOAMORPM(d);
    }

    private dateTOAMORPM(currentDateTime) {
        var hrs = currentDateTime.getHours();
        var mnts = currentDateTime.getMinutes();
        var AMPM = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12;
        hrs = hrs ? hrs : 12;
        mnts = mnts < 10 ? '0' + mnts : mnts;
        var result = hrs + ':' + mnts + ' ' + AMPM;
        return result;
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

export default ChatHistoryScreen;