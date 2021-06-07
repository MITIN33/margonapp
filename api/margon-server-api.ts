import { IUser } from "../models/chat-models";
import { authStore } from "../stores/AuthStore";
import { margonServer } from "./axios-instance";

class MargonAPI {

    public async Me() {
        var authtoken = await authStore.Token();
        var response = await margonServer.get('/me', { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }


    public async ExitChat(dialogId) {
        var authtoken = await authStore.Token();
        var response = await margonServer.delete(`/dialogs/${dialogId}`, { headers: { 'Authorization': `Bearer ${authtoken}` } });

        console.log(JSON.stringify(response));
        return response;
    }

    public async ClearChat(dialogId) {
        var authtoken = await authStore.Token();
        var response = await margonServer.delete(`/dialogs/${dialogId}/clearchat`, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async SendMessage(message) {
        var authtoken = await authStore.Token();
        var response = await margonServer.post(`/chats`, message, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async sendLocation(location) {
        var authtoken = await authStore.Token();
        var response = await margonServer.post(`/users/location`, location, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }


    public async getOrAddUser(user: IUser) {
        var authtoken = await authStore.Token();
        var response = await margonServer.post(`/users`, user, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response.data;
    }

    public async updateUser(user: IUser) {
        var authtoken = await authStore.Token();
        var response = await margonServer.patch(`/users`, user, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response.data;
    }

    public async NearbyUsers(longitude, latitude) {
        var authtoken = await authStore.Token();
        var response = await margonServer.get('/users/nearby', { params: { lon: longitude, lat: latitude }, headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async Dialogs() {
        var authtoken = await authStore.Token();
        var response = await margonServer.get('/dialogs', { params: { limit: 10 }, headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async GetChatList(dialogId: string, continuationToken: string) {
        var authtoken = await authStore.Token();
        var response = await margonServer.get(`/dialogs/${dialogId}/chats`, { params: { limit: 10, continuationToken }, headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async GetBlockedUserList() {
        var authtoken = await authStore.Token();
        var response = await margonServer.get(`/users/blockedList`, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }

    public async BlockUnblockUser(dialogId: string) {
        var authtoken = await authStore.Token();
        var response = await margonServer.post(`/dialogs/${dialogId}/blockunblockuser`, null, { headers: { 'Authorization': `Bearer ${authtoken}` } });
        return response;
    }
}


export const margonAPI = new MargonAPI();