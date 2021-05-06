import axios from "react-native-axios";


export const margonServer = axios.create({
    baseURL: 'http://margonserver.azurewebsites.net/api/v1.0/',
    timeout: 20000,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
});