import { View, Text, Platform, ActivityIndicator } from "react-native";
import React from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import CustomActions from '../components/custom-actions';
import { Image } from 'react-native-elements';

const user = {
    _id: 1,
    name: 'Developer',
}

const renderMessageImage = (props) => {
    return (
        <View
            style={{
                borderRadius: 15,
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
                    borderRadius: 15,
                    resizeMode: "cover",
                }}
                source={{ uri: props.currentMessage.image }}
            />
        </View>
    );
};

class ChatScreen extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    image: 'https://www.koimoi.com/wp-content/new-galleries/2020/04/after-balika-vadhu-mouni-roy-starrer-naagin-s1-to-return-on-tv-001.jpg',
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
            ]
        }
    }

    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
                renderMessageImage={renderMessageImage}
                renderActions={this.renderCustomActions}
            />
        );
    }


    private renderCustomActions = props =>
        Platform.OS === 'web' ? null : (
            <CustomActions {...props} onSend={this.onSendFromUser} />
        )

    private onSendFromUser = (messages: IMessage[] = []) => {
        const createdAt = new Date()
        const messagesToUpload = messages.map(message => ({
            ...message,
            user,
            createdAt,
            _id: Math.round(Math.random() * 1000000),
        }))
        this.onSend(messagesToUpload)
    }

    private onSend(messages) {
        this.setState({
            messages: GiftedChat.append(this.state.messages, messages)
        });
    }
}

export default ChatScreen;