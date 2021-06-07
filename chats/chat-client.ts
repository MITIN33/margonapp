import * as signalR from '@microsoft/signalr';
import { ToastAndroid } from 'react-native';
import { authStore } from '../stores/AuthStore';
import { chatStore } from '../stores/ChatStore';
import { dialogsStore } from '../stores/DialogsStore';
import { locationStore } from '../stores/LocationStore';
import { userstore } from '../stores/UserStore';

const chatHubUrl = "https://margonserver.azurewebsites.net/chatHub";

const connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
  .withUrl(chatHubUrl, { accessTokenFactory: () => authStore.Token(), transport: signalR.HttpTransportType.WebSockets })
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
  if (dialogsStore.selectedDialog !== null) {
    connection.invoke("ChatReadByUser", userId, message.dialogId).catch((e) => console.log(e))
  }
});


connection.on('IsOnline', (userId, isOnline) => {
  dialogsStore.markUserOnlineForDialog(userId, isOnline);
})

connection.on('ChatReadByUser', (userId, dialogId) => {
  chatStore.markMessageRead(userId, dialogId)
})

connection.on('IsTyping', (userId) => {
  dialogsStore.setUserIsTyping(userId, true)
})


class ChatHubStore {

  public connect = () => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection.start()
        .then(() => {
          console.log('SignalR connection started')
          locationStore.watchLocationAsync();
        })
        .catch((error) => console.log("Error in establishing hub connection."));
    }
    else {
      console.log(`Connection: ${connection.connectionId} is already in ${connection.state} state`);
    }
  }

  public async sendMessage(message) {
    if (connection.state === signalR.HubConnectionState.Connected) {
      var response = await connection.invoke("SendMessage", message)
      return response;
    } else {
      this.connect();
    }
  }

  public async sendTypingMessage(toUserId) {
    await connection.invoke("IsTyping", toUserId)
  }

  public stop() {
    connection.stop();
  }

  public isUserReadingChat(receiverUserId, dialogId) {
    connection.invoke("ChatReadByUser", receiverUserId, dialogId).catch((err) => console.log(err))
  }

}

export const chatHubStore = new ChatHubStore();