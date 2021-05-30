import { View, Platform, ActivityIndicator, Text } from "react-native";
import React from "react";
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from "react-native-gifted-chat";
import { Avatar, Image } from 'react-native-elements';
import { StatusBar } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import AccessoryBar from "../components/accessory-bar";
import CustomView from "../components/custom-view";
import AppTheme, { Colors } from "../theme/AppTheme";
import { userstore } from "../stores/UserStore";
import { IDialogs, IMargonChatMessage } from "../models/chat-models";
import { chatStore } from "../stores/ChatStore";
import { observer } from "mobx-react";
import { dialogsStore } from "../stores/DialogsStore";
import { chatHubStore } from "../chats/chat-client";
import { DisabledChatToolbar } from "../components/base-components";

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
        // if (Platform.OS !== 'ios')
        //     StatusBar.setBackgroundColor(AppTheme.colors.themeColor);

        this.user = {
            _id: userstore.user.userId,
            name: userstore.user.displayName,
            avatar: userstore.user.photoUrl
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
        chatStore.selectedDialog = null;
        chatStore.saveChat(this.selectedDialog.dialogId, chatStore.dialogMessages)
        chatStore.setDialogMessages([]);
        dialogsStore.setUnMessageCountZero(this.selectedDialog.dialogId)
    }

    componentDidMount() {
        this._isMounted = true
        this.selectedDialog = chatStore.selectedDialog;
        this.props.navigation.setOptions({ headerTitle: this.selectedDialog.name });
        chatHubStore.isUserReadingChat(this.selectedDialog.otherUserId, this.selectedDialog.dialogId);
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
        console.log('sending message')
        chatHubStore.sendMessage(this.CreateMessageRequest(this.selectedDialog.dialogId, sentMessages))
            .then((chatResponse) => {
                if (!this.selectedDialog.dialogId) {
                    this.selectedDialog.dialogId = chatResponse.dialogId
                }
                dialogsStore.addMessageToDialog(chatResponse);
                chatStore.markMessageDelivered(this.selectedDialog.dialogId)
            })
            .catch((e) => {
                console.error(e.message);
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
    renderLoading() {
        if (chatStore.isLoadingMessages)
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size='large' color={AppTheme.colors.themeColor} /></View>
            )
    }



    render() {




        if (chatStore.isLoadingMessages || !this.selectedDialog) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size='large' color={AppTheme.colors.themeColor} /></View>
            )
        }

        return (
            <View
                style={{ flex: 1 }}
                accessibilityLabel='main'
            >
                <StatusBar backgroundColor={Colors.primary} />

                <GiftedChat
                    messages={chatStore.dialogMessages.slice()}
                    onSend={this.onSend}
                    user={this.user}
                    scrollToBottom
                    loadEarlier={this.state.loadEarlier}
                    onLoadEarlier={this.onLoadEarlier}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    renderSend={this.renderSend}
                    renderInputToolbar={this.selectedDialog.isArchived ? () => <DisabledChatToolbar /> : undefined}
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