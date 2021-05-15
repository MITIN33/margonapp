
import * as signalR from '@microsoft/signalr';
import { ToastAndroid } from 'react-native';
import { IMargonChatMessage } from '../models/chat-models';
import { authStore } from '../stores/AuthStore';

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
    public onChatRead: (dialogId) => void;


    public sendMessage(toUserId, senderUserId, message) {
        // console.log("Message sending:" + JSON.stringify(message));
        return connection.invoke("SendMessage", toUserId, senderUserId, message)
    }

    public sendTypingMessage(toUserId) {
        // console.log("Message sending:" + JSON.stringify(message));
        return connection.invoke("IsTyping", toUserId)
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


        connection.on('ChatRead', (dialogId) => {

        })


        connection.on('IsTyping', (userId) => {

        })
    }
}

export const chatHubClient = new ChatHubclient();