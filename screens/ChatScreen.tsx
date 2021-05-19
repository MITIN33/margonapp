import { View, Platform, ActivityIndicator, Text } from "react-native";
import React from "react";
import { Bubble, GiftedChat, IMessage, Send } from "react-native-gifted-chat";
import { Avatar, Image } from 'react-native-elements';
import { StatusBar } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import AccessoryBar from "../components/accessory-bar";
import CustomView from "../components/custom-view";
import AppTheme from "../theme/AppTheme";
import { userstore } from "../stores/UserStore";
import { IDialogs, IMargonChatMessage, ScreenName } from "../models/chat-models";
import { chatStore } from "../stores/ChatStore";
import { observer } from "mobx-react";
import { dialogsStore } from "../stores/DialogsStore";
import { chatHubStore } from "../chats/chat-client";

export interface IChatScreenSettingStore {
    inverted: boolean,
    loadEarlier: boolean,
    typingText: null,
    isLoadingEarlier: boolean,
    appIsReady: boolean,
    isTyping: boolean,
    isLoading: boolean
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
        if (Platform.OS !== 'ios')
            StatusBar.setBackgroundColor(AppTheme.colors.themeColor);

        this.selectedDialog = this.props.route.params;

        this.user = {
            _id: userstore.user.userId,
            name: userstore.user.firstName,
            avatar: userstore.user.profilePicUrl
        }

        this.sentTypingMessageSignal = true;
        this.state = {
            inverted: false,
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
            appIsReady: false,
            isTyping: false,
            isLoading: true
        }
    }


    componentWillUnmount() {
        this._isMounted = false
        chatHubStore.isUserReadingChat(this.selectedDialog.otherUserId, false);
        dialogsStore.setUnMessageCountZero(this.selectedDialog.dialogId)
    }

    componentDidMount() {
        this._isMounted = true
        chatHubStore.isUserReadingChat(this.selectedDialog.otherUserId, true);
        this.props.navigation.setOptions({ headerTitle: this.selectedDialog.name });

        chatStore.loadChatMessagesForDialogId(this.selectedDialog)
            .then(() => {
                if (this._isMounted) {
                    // init with only system messages
                    this.setState({
                        appIsReady: true,
                        isTyping: false,
                        isLoading: false
                    })
                }
            })
            .catch((e) => console.log(e.message));

    }

    onInputTextChange = (text: string) => {

        if (this.sentTypingMessageSignal && text.length > 0) {
            this.sentTypingMessageSignal = false
            chatHubStore.sendTypingMessage(this.selectedDialog.otherUserId)
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

        const chatMessage: IMargonChatMessage = {
            message: messages[0].text,
            dialogId: this.selectedDialog.dialogId,
            dateSent: Date.now(),
            user: this.user,
        }
        const messageId = Date.now()
        const sentMessages = [{ ...messages[0], _id: messageId, pending: true }]

        chatStore.markMessageSent(this.selectedDialog.dialogId, sentMessages)

        chatHubStore.sendMessage(this.selectedDialog.otherUserId, userstore.user.userId, chatMessage)
            .then(() => {
                chatStore.markMessageDelivered(this.selectedDialog.dialogId, sentMessages)
                dialogsStore.updateDialogWithMessage(chatMessage);
            })
            .catch((e) => {
                console.error(e.message);
            })
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
            <Avatar source={{ uri: props.currentMessage.user.avatar }} rounded ></Avatar>
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

    renderAccessory = () => (
        <AccessoryBar onSend={this.onSendFromUser} isTyping={this.setIsTypingFunc} />
    )

    renderSend = (props: Send['props']) => (
        <Send {...props} containerStyle={{ justifyContent: 'center' }}>
            <MaterialIcons size={30} color={AppTheme.colors.themeColor} name={'send'} />
        </Send>
    )

    renderCustomView(props) {
        return <CustomView {...props} />
    }

    renderBubble = (props: any) => {
        return <Bubble wrapperStyle={{
            right: {
                backgroundColor: AppTheme.colors.themeColor
            },
            left: {
                backgroundColor: 'white'
            }
        }}
            {...props} />
    }

    render() {


        if (this.state.isLoading) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>
        }

        const chatMessages = chatStore.messagePerDialogsMap.get(this.selectedDialog.dialogId).slice();

        return (
            <View
                style={{ flex: 1 }}
                accessibilityLabel='main'
            >
                <GiftedChat
                    messages={chatMessages}
                    onSend={this.onSend}
                    user={this.user}
                    scrollToBottom
                    shouldUpdateMessage={(props, nextProps) =>
                        props.currentMessage.received !== nextProps.currentMessage.received
                    }
                    loadEarlier={this.state.loadEarlier}
                    onLoadEarlier={this.onLoadEarlier}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    renderSend={this.renderSend}
                    renderMessageImage={this.renderMessageImage}
                    isTyping={this.selectedDialog.isUserTyping}
                    renderBubble={this.renderBubble}
                    renderCustomView={this.renderCustomView}
                    infiniteScroll
                    onInputTextChanged={this.onInputTextChange}
                    renderAvatar={this.renderAvatarImage}
                    renderAccessory={this.renderAccessory}
                />
            </View>
        );
    }
}

export default ChatScreen;