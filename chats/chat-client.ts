import * as signalR from '@microsoft/signalr';
import { authStore } from '../stores/AuthStore';
import { chatStore } from '../stores/ChatStore';
import { dialogsStore } from '../stores/DialogsStore';

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
  console.log("You are offline");
})

connection.onreconnected(() => {
  console.log("Back online");
})

connection.onclose(() => {
  console.log("Connection closed");
})

connection.on("ReceiveMessage", (userId, message) => {
  chatStore.onMessageReceive(message);
  dialogsStore.addMessageToDialog(message);
});


connection.on('IsOnline', (userId, isOnline) => {
  dialogsStore.markUserOnlineForDialog(userId, isOnline);
})

connection.on('IsReadingChat', (userId, isReadingChat) => {
  chatStore.markAllMessageRead(userId, isReadingChat)
})

connection.on('IsTyping', (userId) => {
  dialogsStore.setUserIsTyping(userId, true);
})


class ChatHubStore {

  public connect = () => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection.start()
        .then(() => console.log('SignalR connection started'))
        .catch((error) => console.log("Error in establishing hub connection."));
    }
    else {
      console.log(`Connection: ${connection.connectionId} is already in ${connection.state} state`);
    }
  }

  public async sendTypingMessage(toUserId) {
    await connection.invoke("IsTyping", toUserId)
  }

  public isUserReadingChat(thisUserId, isReading) {
    connection.invoke("IsReadingChat", thisUserId, isReading)
      .catch(() => console.log('Error in sending message'))
  }

}

export const chatHubStore = new ChatHubStore();