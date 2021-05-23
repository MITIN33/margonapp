import { Linking } from 'expo'
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { Alert, Vibration } from 'react-native'
import { margonAPI } from '../api/margon-server-api'

class LocationStore {

    private async getPermissionAsync(permission) {
        const { status } = await Permissions.askAsync(permission)
        if (status !== 'granted') {
            const permissionName = permission.toLowerCase().replace('_', ' ')
            Alert.alert(
                'Cannot be done 😞',
                `If you would like to use this feature, you'll need to enable the ${permissionName} permission in your phone settings.`,
                [
                    {
                        text: "Let's go!",
                        onPress: () => Linking.openURL('app-settings:'),
                    },
                    { text: 'Nevermind', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: true },
            )

            return false
        }
        return true
    }

    public async getCurrentLocationAsync() {
        if (await this.getPermissionAsync(Permissions.LOCATION)) {
            const location = await Location.getCurrentPositionAsync({})
            if (location) {
                return location
            }
        }
        return null;
    }

    public async watchLocationAsync() {
        if (await this.getPermissionAsync(Permissions.LOCATION)) {
            Location.watchPositionAsync({ distanceInterval: 10 }, (location: Location.LocationObject) => {
                console.log(JSON.stringify(location.coords))
                margonAPI.sendLocation(location)
            })
        }
    }

    public sendlocationToServer = (locations) => {
        console.log('Received new locations', JSON.stringify(locations));
    }
}

export const locationStore = new LocationStore();