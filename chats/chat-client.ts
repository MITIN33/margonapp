
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

connection.on("ReceiveError", (error, stackTrace) => {
    console.log("Received message from server: " + error);
});

connection.onreconnecting(() => {
    ToastAndroid.show("You are offline", ToastAndroid.LONG);
})

connection.onreconnected(() => {
    ToastAndroid.show("Back online", ToastAndroid.LONG);
})
class ChatHubclient {

    public onMessageReceiveFunc: (message: IMargonChatMessage) => void;
    public onMessageReceiveHomeFunc: (message: IMargonChatMessage) => void;

    public sendMessage(toUserId, senderUserId, message) {
        // console.log("Message sending:" + JSON.stringify(message));
        return connection.invoke("SendMessage", toUserId, senderUserId, message)
    }

    public async stetupConnection() {

        if (connection.state === signalR.HubConnectionState.Disconnected) {
            try {
                await connection.start();
                this.registerEvents(connection);
            } catch (error) {
                console.log("Error in establishing hub connection, retrying again.")
            }
        }
        else {
            console.log("CONNECTION ID: ALready active: " + connection.connectionId);
        }
    }

    private registerEvents(connection: signalR.HubConnection) {
        connection.on("ReceiveMessage", (userId, message) => {
            console.log("Received message from server: " + message.message);
            if (this.onMessageReceiveFunc)
                this.onMessageReceiveFunc(message);
            if (this.onMessageReceiveHomeFunc)
                this.onMessageReceiveHomeFunc(message);
        });
    }
}

export const chatHubClient = new ChatHubclient();