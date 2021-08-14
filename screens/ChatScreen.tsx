import { View, ActivityIndicator, Text, Modal } from "react-native";
import React from "react";
import { Bubble, GiftedChat, IMessage, Send } from "react-native-gifted-chat";
import { Avatar, Image, ListItem } from 'react-native-elements';
import { StatusBar } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import AccessoryBar from "../components/accessory-bar";
import CustomView from "../components/custom-view";
import { Colors } from "../theme/AppTheme";
import { userstore } from "../stores/UserStore";
import { IDialogs, IMargonChatMessage } from "../models/chat-models";
import { chatStore } from "../stores/ChatStore";
import { observer } from "mobx-react";
import { dialogsStore } from "../stores/DialogsStore";
import { chatHubStore } from "../chats/chat-client";
import { DisabledChatToolbar } from "../components/base-components";
import ChatContextMenu from "../components/context-menu";
import { Overlay } from "react-native-elements";
import { ToastAndroid } from "react-native";

export interface IChatScreenSettingStore {
    inverted: boolean,
    loadEarlier: boolean,
    typingText: null,
    isLoadingEarlier: boolean,
    appIsReady: boolean,
    isTyping: boolean,
    isLoading: boolean,
    showContextMenu: boolean
}

@observer
class ChatScreen extends React.Component<any, IChatScreenSettingStore> {


    private _isMounted = false

    user;
    selectedDialog: IDialogs;
    sentTypingMessageSignal: boolean;
    isOtherUserReadingChat: boolean = false;

    constructor(props) {
        super(props);

        this.user = {
            _id: userstore.user.userId,
            name: userstore.user.displayName,
            avatar: userstore.user.photoUrl
        }

        this.selectedDialog = this.props.route.params;

        this.sentTypingMessageSignal = true;
        this.state = {
            inverted: false,
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
            appIsReady: false,
            isTyping: false,
            isLoading: true,
            showContextMenu: true
        }
    }

    componentDidMount() {
        this._isMounted = true
        dialogsStore.setSelectedDialog(this.selectedDialog);
        this.props.navigation.setOptions({
            headerTitle: this.selectedDialog.name,
            headerRight: () => <ChatContextMenu navigation={this.props.navigation} />
        });
        if (!dialogsStore.hasUserBlocked())
            chatHubStore.isUserReadingChat(this.selectedDialog.otherUserId, this.selectedDialog.dialogId);
        chatStore.loadChatMessagesForDialogId(this.selectedDialog)
            .then(() => {
                if (this._isMounted) {
                    // init with only system messages
                    this.setState({
                        appIsReady: true,
                        isTyping: false
                    })
                }
            })
            .catch((e) => console.log(e.message));

    }




    componentWillUnmount() {
        this._isMounted = false
        dialogsStore.setUnMessageCountZero(this.selectedDialog.dialogId)
        chatStore.unloadChatData();
    }

    onInputTextChange = (text: string) => {

        if (this.sentTypingMessageSignal && text.length > 0 && !dialogsStore.hasUserBlocked()) {
            this.sentTypingMessageSignal = false
            chatHubStore.sendTypingMessage(this.selectedDialog.otherUserId)
                .catch(() => console.log('Error in sendingmessage'))
                .finally(() => {
                    setTimeout(() => {
                        this.sentTypingMessageSignal = true
                    }, 10000);
                });
        }
    }

    onLoadEarlier = () => {
        this.setState({ isLoadingEarlier: true });
        chatStore.loadEarlierChatMessagesForDialogId(this.selectedDialog)
            .then(() => {
                this.setState({ isLoadingEarlier: false, loadEarlier: true })
            })
            .catch((e) => console.log(e.message));
    }

    onSend = (messages: IMessage[] = []) => {

        const messageId = Date.now()
        const sentMessages = { ...messages[0], _id: messageId, pending: true }

        chatStore.addMessage(sentMessages)
        chatHubStore.sendMessage(this.CreateMessageRequest(this.selectedDialog.dialogId, sentMessages))
            .then((chatResponse) => {
                if (!this.selectedDialog.dialogId) {
                    this.selectedDialog.dialogId = chatResponse.dialogId
                }
                dialogsStore.addMessageToDialog(chatResponse);
                chatStore.markMessageDelivered(this.selectedDialog.dialogId)
            })
            .catch((e) => {
                console.error();
                if(e.response.status == 403){
                    ToastAndroid.show('You cannot send messages to this chat', ToastAndroid.SHORT);
                }
            })
    }

    CreateMessageRequest(dialogId, messages: IMessage) {

        const msg: IMargonChatMessage = {
            message: messages.text,
            dialogId: dialogId,
            dateSent: Date.now(),
            user: this.user,
            receiverUser: {
                _id: this.selectedDialog.otherUserId,
                name: this.selectedDialog.name,
                avatar: this.selectedDialog.photoUrl
            }
        }
        return msg;
    }


    renderMessageImage = (props) => {
        return (
            <View
                style={{
                    borderRadius: 5,
                    padding: 2,
                }}
            >
                <Image
                    resizeMode="contain"
                    PlaceholderContent={<ActivityIndicator />}
                    style={{
                        width: 200,
                        height: 200,
                        padding: 6,
                        borderRadius: 5,
                    }}
                    source={{ uri: props.currentMessage.image }}
                />
            </View>
        )
    };

    renderAvatarImage = (props) => {
        return (
            <Avatar source={{ uri: props.currentMessage.user.avatar }} rounded >
                {/* {(this.selectedDialog.isUserOnline && dialogsStore.blockedListCount() == 0) ? <Avatar.Accessory source={require('../assets/online-image.png')} /> : null} */}
            </Avatar>
        )
    };

    onSendFromUser = (messages: IMessage[] = []) => {
        const createdAt = new Date()
        const messagesToUpload = messages.map(message => ({
            ...message,
            user: this.user,
            createdAt,
            _id: Math.round(Math.random() * 1000000),
        }))
        this.onSend(messagesToUpload)
    }

    setIsTypingFunc = (userId) => {
        console.log(`$User :${userId} is typing`);
        if (this.selectedDialog.otherUserId === userId) {
            this.setState({
                isTyping: !this.state.isTyping,
            })
            setTimeout(() => {
                this.setState({ isTyping: false })
            }, 5000);
        }
    }

    renderContextMenu() {

        const menuItems = [
            {
                title: 'Block',
                action: () => { }
            },
            {
                title: 'Exit',
                action: () => { }
            }
        ]

        return (
            <Modal
                transparent
                visible={this.state.showContextMenu}
                onRequestClose={() => this.setState({ showContextMenu: false })}
            >
                <View style={{ width: 120, top: 20, right: 15, zIndex: 10000, position: 'absolute' }}>
                    {menuItems.map((item, i) => (
                        <ListItem key={i} bottomDivider onPress={item.action}>
                            <ListItem.Content>
                                <ListItem.Title>{item.title}</ListItem.Title>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </View>

            </Modal>
        )
    };

    renderAccessory = () => (
        <AccessoryBar onSend={this.onSendFromUser} isTyping={this.setIsTypingFunc} />
    )

    renderSend = (props: Send['props']) => (
        <Send {...props} containerStyle={{ justifyContent: 'center', marginRight: 5 }}>
            <MaterialIcons size={30} color={Colors.primary} name={'send'} />
        </Send>
    )

    renderCustomView(props) {
        return <CustomView {...props} />
    }

    renderBubble = (props: any) => {
        return <Bubble wrapperStyle={{
            right: {
                backgroundColor: Colors.primary,
            },
            left: {
                backgroundColor: 'white'
            }
        }}
            {...props} />
    }

    renderLoading() {
        return (
            <Overlay isVisible={chatStore.isLoading} statusBarTranslucent>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size='large' color={Colors.primary} />
                    <Text style={{ fontSize: 20, color: 'black', padding: 10 }}>Loading...</Text>
                </View>
            </Overlay>
        )
    }


    render() {
        let isBlocked = dialogsStore.selectedDialog && dialogsStore.selectedDialog.blockedByUserIds && dialogsStore.selectedDialog.blockedByUserIds.length > 0;
        return (
            <View
                style={{ flex: 1 }}
                accessibilityLabel='main'
            >
                <StatusBar backgroundColor={Colors.themeColor} />
                {this.renderLoading()}
                <GiftedChat
                    messages={chatStore.dialogMessages.slice()}
                    onSend={this.onSend}
                    user={this.user}
                    scrollToBottom
                    loadEarlier={this.state.loadEarlier}
                    onLoadEarlier={this.onLoadEarlier}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    renderSend={this.renderSend}
                    renderInputToolbar={isBlocked ? () => <DisabledChatToolbar /> : undefined}
                    renderMessageImage={this.renderMessageImage}
                    isTyping={this.selectedDialog.isUserTyping}
                    renderBubble={this.renderBubble}
                    renderCustomView={this.renderCustomView}
                    infiniteScroll
                    onInputTextChanged={this.onInputTextChange}
                    renderAvatar={this.renderAvatarImage}
                    // renderAccessory={this.renderAccessory}
                />
            </View>
        );
    }
}

export default ChatScreen;