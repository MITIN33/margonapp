import * as signalR from '@microsoft/signalr';
import { ToastAndroid } from 'react-native';
import { authStore } from '../stores/AuthStore';
import { chatStore } from '../stores/ChatStore';
import { dialogsStore } from '../stores/DialogsStore';

const chatHubUrl = "http://margonserver.azurewebsites.net/chatHub";

const connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
  .withUrl(chatHubUrl, { accessTokenFactory: () => authStore.Token() })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Error)
  .build();


console.log('Chat hub Module triggereed ');

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

connection.on("ReceiveMessage", (userId, message) => {
  chatStore.onMessageReceive(message);
  dialogsStore.updateDialogWithMessage(message);
});


connection.on('IsOnline', (userId, isOnline) => {
  console.log(`User ${userId}, OnlineStatus: ${isOnline}`);
  dialogsStore.markUserOnlineForDialog(userId, isOnline);
})

connection.on('IsReadingChat', (userId, isReadingChat) => {
  chatStore.markAllMessageRead(userId, isReadingChat)
})


connection.on('IsTyping', (userId) => {
  dialogsStore.setUserIsTyping(userId, true);
})

if (connection.state === signalR.HubConnectionState.Disconnected) {
  connection.start()
    .then(() => console.log('SignalR connection started'))
    .catch((error) => console.log("Error in establishing hub connection."));
}
else {
  console.log(`CONNECTION ID: ALready in ${connection.state} state: ` + connection.connectionId);
}


class ChatHubStore {
    public sendMessage(toUserId, senderUserId, message) {
        return connection.invoke("SendMessage", toUserId, senderUserId, message)
    }

    public sendTypingMessage(toUserId) {
        return connection.invoke("IsTyping", toUserId)
    }

    public isUserReadingChat(thisUserId, isReading) {
        return connection.invoke("IsReadingChat", thisUserId, isReading)
    }
}


export const chatHubStore = new ChatHubStore();