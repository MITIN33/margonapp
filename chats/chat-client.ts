
import * as signalR from '@microsoft/signalr';
import { ToastAndroid } from 'react-native';
import { IMargonChatMessage } from '../models/chat-models';
import { authStore } from '../stores/AuthStore';
import { chatStore } from '../stores/ChatStore';
import { userstore } from '../stores/UserStore';

const chatHubUrl = "http://margonserver.azurewebsites.net/chatHub";

const connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(chatHubUrl, { accessTokenFactory: () => authStore.Token() })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Error)
    .build();

connection.on("ReceiveError", (error) => {
    console.log("Received message from server: " + error);
});

connection.onreconnecting(() => {
    ToastAndroid.show("You are offline", ToastAndroid.LONG);
})

connection.onreconnected(() => {
    ToastAndroid.show("Back online", ToastAndroid.LONG);
})

connection.onclose(() => {
    console.log("Connection closed");
})
class ChatHubclient {

    public onMessageReceiveFunc: (message: IMargonChatMessage) => void;
    public onMessageReceiveHomeFunc: (message: IMargonChatMessage) => void;
    public onChatRead: (dialogId, isChatRead) => void;
    public userIsTyping: (dialogId) => void;
    public isUserOnline: (userId, isOnline) => void;



    public sendMessage(toUserId, senderUserId, message) {
        return connection.invoke("SendMessage", toUserId, senderUserId, message)
    }

    public sendTypingMessage(toUserId) {
        return connection.invoke("IsTyping", toUserId)
    }

    public isUserReadingChat(thisUserId, isReading) {
        // console.log("Message sending:" + JSON.stringify(message));
        return connection.invoke("IsReadingChat", thisUserId, isReading)
    }

    public async stetupConnection() {

        if (connection.state === signalR.HubConnectionState.Disconnected) {
            try {
                console.log(`Connection in ${connection.state} , starting new connection .`)
                await connection.start();
                this.registerEvents(connection);
            } catch (error) {
                console.log("Error in establishing hub connection, retrying again.")
            }
        }
        else {
            console.log(`CONNECTION ID: ALready in ${connection.state} state: ` + connection.connectionId);
        }
    }

    private registerEvents(connection: signalR.HubConnection) {
        connection.on("ReceiveMessage", (userId, message) => {
            console.log("Received message from server: " + message.message);
            // console.log(`Chat ${this.onMessageReceiveFunc} and Home ${this.onMessageReceiveHomeFunc}`);
            if (this.onMessageReceiveFunc)
                this.onMessageReceiveFunc(message);
            if (this.onMessageReceiveHomeFunc)
                this.onMessageReceiveHomeFunc(message);
        });


        connection.on('IsOnline', (userId, isOnline) => {
            console.log(`User ${userId}, OnlineStatus: ${isOnline}`);
            // userstore.isUserReadingChatMap.set(userId, isOnline);
            chatStore.markUserOnlineForDialog(userId, isOnline);
        })

        connection.on('IsReadingChat', (userId, isReadingChat) => {
            // console.log(`User ${userId}, IsReading: ${isReadingChat}`);
            //userstore.isUserReadingChatMap.set(userId, isReadingChat);
            if (this.onChatRead)
                this.onChatRead(userId, isReadingChat)
        })


        connection.on('IsTyping', (userId) => {
            if (this.userIsTyping) {
                this.userIsTyping(userId)
            }
        })
    }
}

export const chatHubClient = new ChatHubclient();