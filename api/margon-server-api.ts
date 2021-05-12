import { IChatMessage, IMessage } from "react-native-gifted-chat";
import { chatHubClient } from "../chats/chat-client";
import { IAttachments, IChatRequest, MediaType } from "../models/chat-models";
import { userstore } from "../stores/UserStore";
import { margonServer } from "./axios-instance";

class MargonAPI {

    public authToken: string;

    public async Me() {
        var response = await margonServer.get('/me', { headers: { 'Authorization': `Bearer ${this.authToken}` } });
        return response;
    }

    public async GetToken(userLoginRequest) {
        var response = await margonServer.post('/auth/token', userLoginRequest);
        return response;
    }

    public async SignUp(userSignRequest) {
        var response = await margonServer.post('/auth/signup', userSignRequest);
        return response;
    }

    public async Dialogs() {
        var response = await margonServer.get('/dialogs', { headers: { 'Authorization': `Bearer ${this.authToken}` } });
        return response;
    }

    public async GetChatList(dialogId: string) {
        var response = await margonServer.get(`/dialogs/${dialogId}/chats?limit=10`, { headers: { 'Authorization': `Bearer ${this.authToken}` } });
        return response;
    }

    public async SendMessage(toUserId: string, fromUserId, message: IMessage, dialogId: string) {
        let chatRequest: IChatRequest;
        chatRequest = {
            message: message.text,
            dialogId: dialogId,
            dateSent: Date.now(),
            attachments: this.getAttachments(message),
        }
        try {
            var response = await chatHubClient.sendMessage(toUserId, fromUserId, chatRequest);
            return response;
        }
        catch (ex) {
            throw ex;
        }
    }

    private getAttachments(message: IChatMessage): IAttachments {
        let attachments: IAttachments;
        if (message.image) {
            attachments.id = '123';
            attachments.type = MediaType.Image;
            attachments.url = "https://bloblstorage.azurewebsite.net/image123.jpg";
            return attachments;
        }
        return null;
    }

}


export const margonAPI = new MargonAPI();