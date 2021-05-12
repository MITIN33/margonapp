import { View, Platform, ActivityIndicator, Text } from "react-native";
import React from "react";
import { Bubble, GiftedChat, IMessage, Send } from "react-native-gifted-chat";
import CustomActions from '../components/custom-actions';
import { Avatar, Image } from 'react-native-elements';
import { StatusBar } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import messagesData from '../api/message';
import earlierMessages from '../api/earlierMessages';
import AccessoryBar from "../components/accessory-bar";
import CustomView from "../components/custom-view";
import AppTheme from "../theme/AppTheme";
import { margonAPI } from "../api/margon-server-api";
import { userstore } from "../stores/UserStore";
import { chatHubClient } from "../chats/chat-client";
import { IChatRequest, IDialogs } from "../models/chat-models";
import { chatStore } from "../stores/ChatStore";



const filterBotMessages = message =>
    !message.system && message.user && message.user._id && message.user._id === 2
const findStep = step => message => message._id === step

class ChatScreen extends React.Component<any, any> {


    private _isMounted = false

    otherUser;
    photoUrl;
    name;
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

        chatHubClient.onMessageReceive(this.onReceive);

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
    }

    componentDidMount() {
        this._isMounted = true

        margonAPI.GetChatList(this.selectedDialog.dialogId)
            .then((response) => {
                let messages = [];
                if (response.data) {
                    messages = this.loadMessages(response.data['items']);
                }
                response.data['items']
                // init with only system messages
                this.setState({
                    messages: messages, // messagesData.filter(message => message.system),
                    appIsReady: true,
                    isTyping: false,
                    isLoading: false
                })
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
                user: {
                    _id: val.userId,
                    name: this.name,
                    avatar: this.photoUrl
                }
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

        setTimeout(() => {
            if (this._isMounted === true) {
                this.setState((previousState: any) => {
                    return {
                        messages: GiftedChat.prepend(
                            previousState.messages,
                            earlierMessages() as IMessage[],
                            Platform.OS !== 'web',
                        ),
                        loadEarlier: true,
                        isLoadingEarlier: false,
                    }
                })
            }
        }, 1000) // simulating network
    }


    onSend = (messages: IMessage[] = []) => {
        const step = this.state.step + 1
        margonAPI.SendMessage(this.otherUser._id, userstore.user.userId, messages[0], this.selectedDialog.dialogId)
            .then(() => {
                chatStore.updateDialogWithId(this.selectedDialog, messages[0].text)
                this.setState((previousState: any) => {
                    const sentMessages = [{ ...messages[0], sent: true, received: false }]
                    return {
                        messages: GiftedChat.append(
                            previousState.messages,
                            sentMessages,
                            Platform.OS !== 'web',
                        ),
                        step,
                    }
                })
            }).catch((e) => console.error(e.message));

        //for demo purpose
        //setTimeout(() => this.botSend(step), 1000)
    }

    botSend = (step = 0) => {
        const newMessage = (messagesData as IMessage[])
            .reverse()
            //.filter(filterBotMessages)
            .find(findStep(step))
        if (newMessage) {
            this.setState((previousState: any) => ({
                messages: GiftedChat.append(
                    previousState.messages,
                    [newMessage],
                    Platform.OS !== 'web',
                ),
            }))
        }
    }

    onReceive = (userId: string, message) => {
        this.setState((previousState: any) => {
            return {
                messages: GiftedChat.append(
                    previousState.messages as any,
                    [
                        {
                            _id: Math.abs(Math.random() * 10000),
                            text: message.message,
                            createdAt: new Date(),
                            user: this.otherUser,
                        },
                    ],
                    Platform.OS !== 'web',
                ),
            }
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
            <MaterialIcons size={30} color={'tomato'} name={'send'} />
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
                    bottomOffset={54}
                    renderBubble={this.renderBubble}
                    renderCustomView={this.renderCustomView}
                    infiniteScroll
                    renderAvatar={this.renderAvatarImage}
                    renderAccessory={Platform.OS === 'web' ? null : this.renderAccessory}
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