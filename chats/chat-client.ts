
import * as signalR from '@microsoft/signalr';
import { asyncStorage } from '../models/async-storage';
// import { userstore } from '../stores/UserStore';

const chatHubUrl = "http://margonserver.azurewebsites.net/chatHub";



class ChatHubclient {

    public connection: signalR.HubConnection;

    public sendMessage(toUserId, senderUserId, message) {
        return this.connection.invoke("SendMessage", toUserId, senderUserId, message)
    }

    public onMessageReceive(onReceive) {
        this.connection.on("ReceiveMessage", (userId, message) => {
            onReceive(userId, message);
        });

        this.connection.on("ReceiveError", (userId, message) => {
            console.log("Receive error from signalR: " + message);
        });
    }

    public async createConnection(userId, authtoken) {

        console.log("Connection SignalR:" + this.connection);
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(chatHubUrl, { accessTokenFactory: () => authtoken })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.onclose(() => {
            console.log("Connection closed");
        })

        try {
            await this.connection.start();

            if (this.connection.connectionId) {
                asyncStorage.saveData("CHAT_CONNECTIONID", this.connection.connectionId);
            }
            console.log("Connection Id : " + this.connection.connectionId);
        } catch (error) {
            console.log("Error in creation websocket connection: " + error.message)
        }

    }
}

export const chatHubClient = new ChatHubclient();