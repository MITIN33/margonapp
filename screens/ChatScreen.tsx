import { View, Platform, ActivityIndicator, Text, KeyboardAvoidingView } from "react-native";
import React from "react";
import { Bubble, GiftedChat, IChatMessage, IMessage, Send } from "react-native-gifted-chat";
import { Avatar, Image } from 'react-native-elements';
import { StatusBar } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import AccessoryBar from "../components/accessory-bar";
import CustomView from "../components/custom-view";
import AppTheme from "../theme/AppTheme";
import { userstore } from "../stores/UserStore";
import { chatHubClient } from "../chats/chat-client";
import { IAttachments, IDialogs, IMargonChatMessage, MediaType, ScreenName } from "../models/chat-models";
import { chatStore } from "../stores/ChatStore";

class ChatScreen extends React.Component<any, any> {


    private _isMounted = false

    otherUser;
    user;
    selectedDialog: IDialogs;

    constructor(props) {
        super(props);
        if (Platform.OS !== 'ios')
            StatusBar.setBackgroundColor('#71afe5');

        this.selectedDialog = this.props.route.params;
        this.otherUser = {
            _id: this.selectedDialog.otherUserId,
            name: this.selectedDialog.name,
            avatar: this.selectedDialog.photoUrl
        }
        this.user = {
            _id: userstore.user.userId,
            name: userstore.user.firstName,
            avatar: userstore.user.profilePicUrl
        }
        this.state = {
            inverted: false,
            step: 0,
            messages: [],
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
        chatHubClient.onMessageReceiveFunc = null;
    }

    componentDidMount() {
        this._isMounted = true
        chatHubClient.onMessageReceiveFunc = this.onReceive;
        this.props.navigation.setOptions({ headerTitle: this.selectedDialog.name });

        chatStore.loadChatMessagesForDialogId(this.selectedDialog.dialogId)
            .then((response) => {
                if (this._isMounted) {
                    let messages = [];
                    messages = this.loadMessages(response);
                    // init with only system messages
                    this.setState({
                        messages: messages,
                        appIsReady: true,
                        isTyping: false,
                        isLoading: false
                    })
                }
            })
            .catch((e) => console.log(e.message));

    }

    loadMessages(msg: any) {
        let messages = [];

        msg.map((val, k) => {
            messages.push({
                _id: val.id,
                createdAt: val.dateSent,
                text: val.message,
                user: val.userId === this.user._id ? this.user : this.otherUser,
                sent: true,
                received: true
            })
        });

        return messages;
    }

    onLoadEarlier = () => {
        this.setState(() => {
            return {
                isLoadingEarlier: true,
            }
        })
        chatStore.loadEarlierChatMessagesForDialogId(this.selectedDialog.dialogId)
            .then((response) => {
                let messages = [];
                messages = this.loadMessages(response);
                // init with only system messages
                this.setState((previousState: any) => {
                    return {
                        messages: GiftedChat.prepend(
                            previousState.messages,
                            messages,
                            Platform.OS !== 'web',
                        ),
                        isLoadingEarlier: false,
                        loadEarlier: true
                    }
                })
            })
            .catch((e) => console.log(e.message));
    }


    onSend = (messages: IMessage[] = []) => {

        const chatMessage: IMargonChatMessage = {
            message: messages[0].text,
            dialogId: this.selectedDialog.dialogId,
            dateSent: Date.now(),
            attachments: this.getAttachments(messages[0]),
            userId: this.user._id,
        }
        const messageId = Date.now()
        this.setState((previousState: any) => {
            const sentMessages = [{ ...messages[0], _id: messageId, pending: true }]
            return {
                messages: GiftedChat.append(
                    previousState.messages,
                    sentMessages,
                    Platform.OS !== 'web',
                )
            }
        })

        chatHubClient.sendMessage(this.otherUser._id, userstore.user.userId, chatMessage)
            .then(() => {
                chatStore.updateDialogWithMessage(chatMessage, ScreenName.ChatScreen)
                const list = this.state.messages
                list.map((x: IMessage, i) => {
                    if (x._id === messageId) {
                        x.pending = false
                        x.sent = true
                        x.received = true
                    }
                })
                this.setState({ messages: list });
            })
            .catch((e) => {
                console.error(e.message);
            })
    }

    private getAttachments(message: IChatMessage): IAttachments {
        let attachments: IAttachments;
        if (message.image) {
            attachments.id = '123';
            attachments.type = MediaType.Image;
            attachments.url = "https://bloblstorage.azurewebsite.net/image123.jpg";
            return attachments;
        }
        return null;
    }

    onReceive = (message: IMargonChatMessage) => {
        // console.log("Message on chat scree:" + JSON.stringify(message))
        this.setState((previousState: any) => {
            return {
                messages: GiftedChat.append(
                    previousState.messages as any,
                    [
                        {
                            _id: message.id,
                            text: message.message,
                            createdAt: new Date(),
                            user: this.otherUser,
                            sent: true,
                            received: true
                        },
                    ],
                    Platform.OS !== 'web',
                ),
            }
        })
    }

    onChatRead = (dialogId: string) => {

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
            user: {
                _id: userstore.user.userId,
                name: userstore.user.firstName,
                avatar: userstore.user.profilePicUrl
            },
            createdAt,
            _id: Math.round(Math.random() * 1000000),
        }))
        this.onSend(messagesToUpload)
    }

    setIsTyping = () => {
        this.setState({
            isTyping: !this.state.isTyping,
        })
    }

    renderAccessory = () => (
        <AccessoryBar onSend={this.onSendFromUser} isTyping={this.setIsTyping} />
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

        return (
            <View
                style={{ flex: 1 }}
                accessibilityLabel='main'
                testID='main'
            >
                <GiftedChat
                    messages={this.state.messages}
                    onSend={this.onSend}
                    user={{
                        _id: userstore.user.userId,
                        name: userstore.user.firstName,
                        avatar: userstore.user.profilePicUrl
                    }}
                    scrollToBottom
                    loadEarlier={this.state.loadEarlier}
                    onLoadEarlier={this.onLoadEarlier}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    renderSend={this.renderSend}
                    renderMessageImage={this.renderMessageImage}
                    isTyping={this.state.isTyping}
                    renderBubble={this.renderBubble}
                    renderCustomView={this.renderCustomView}
                    infiniteScroll
                    renderAvatar={this.renderAvatarImage}
                // renderAccessory={Platform.OS === 'web' ? null : this.renderAccessory}
                />
            </View>
        );
    }


    // private onSendFromUser = (messages: IMessage[] = []) => {
    //     const createdAt = new Date()
    //     const messagesToUpload = messages.map(message => ({
    //         ...message,
    //         user,
    //         createdAt,
    //         _id: Math.round(Math.random() * 1000000),
    //     }))
    //     this.onSend(messagesToUpload)
    // }

    // private onSend(messages) {
    //     this.setState({
    //         messages: GiftedChat.append(this.state.messages, messages)
    //     });
    // }
}

export default ChatScreen;