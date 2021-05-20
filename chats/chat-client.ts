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


console.log('Chat hub Module triggereed ');

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
  console.log(`User ${userId}, OnlineStatus: ${isOnline}`);
  dialogsStore.markUserOnlineForDialog(userId, isOnline);
})

connection.on('IsReadingChat', (userId, isReadingChat) => {
  chatStore.markAllMessageRead(userId, isReadingChat)
})


connection.on('IsTyping', (userId) => {
  dialogsStore.setUserIsTyping(userId, true);
})




class ChatHubStore {

  public connect() {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection.start()
        .then(() => console.log('SignalR connection started'))
        .catch((error) => console.log("Error in establishing hub connection."));
    }
    else {
      console.log(`CONNECTION ID: ALready in ${connection.state} state: ` + connection.connectionId);
    }
  }

  public sendMessage(message) {
    return connection.invoke("SendMessage", message)
  }

  public sendTypingMessage(toUserId) {
    return connection.invoke("IsTyping", toUserId)
  }

  public isUserReadingChat(thisUserId, isReading) {
    return connection.invoke("IsReadingChat", thisUserId, isReading)
  }

  public isUserOnline(userId) {
    return connection.invoke("IsUserOnline", userId)
  }
}


export const chatHubStore = new ChatHubStore();