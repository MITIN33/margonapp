import AsyncStorage from "@react-native-async-storage/async-storage"

class AsyncStorageHelper {

    public saveData(key, value) {
        if (value) {
            console.log('Savng data:' + JSON.stringify(value));
            AsyncStorage.setItem(key, JSON.stringify(value), (err) => {
                if (err) {
                    console.log("an error");
                    throw err;
                }
                console.log('Successfully saved data in local store');
            }).catch((err) => {
                console.log("error is: " + err);
            });
        }
    }

    public async getData(key) {
        const data = await AsyncStorage.getItem(key);
        return JSON.parse(data);
    }

    public removeKey(key, callback) {
        AsyncStorage.removeItem(key)
            .then(() => callback())
            .catch((err) => console.log(err));
    }
}

export const asyncStorage = new AsyncStorageHelper();