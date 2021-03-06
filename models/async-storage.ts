import AsyncStorage from "@react-native-async-storage/async-storage"

class AsyncStorageHelper {

    public async saveData(key, value) {
        if (value) {
            await AsyncStorage.setItem(key, JSON.stringify(value), (err) => {
                if (err) {
                    console.log("an error");
                    throw err;
                }
                console.log('Successfully saved data in local store for ' + key);
            }).catch((err) => {
                console.log(`Error in saving data to store [${key}]: ${err}`);
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

    public clearAllData(callback) {
        AsyncStorage.clear()
            .then(() => callback())
            .catch((err) => console.log(err));
    }
}

export const asyncStorage = new AsyncStorageHelper();