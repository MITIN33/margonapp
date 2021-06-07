import { Linking } from 'expo'
import * as Permissions from 'expo-permissions'

import { Alert, ToastAndroid } from 'react-native'
import { locationStore } from '../stores/LocationStore'
import * as ImagePicker from 'react-native-image-picker'

export default async function getPermissionAsync(permission) {
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

export async function getLocationAsync(onSend) {
  if (await getPermissionAsync(Permissions.LOCATION)) {
    const location = await locationStore.getCurrentLocationAsync();
    if (location) {
      onSend([{ location: location.coords }])
    }
  }
}

// export async function pickImageAsync(onSend) {
//   if (await getPermissionAsync(Permissions.CAMERA_ROLL)) {
//     const result = await ImagePicker.launchImageLibrary({
//       allowsEditing: true,
//       aspect: [4, 3],
//     })

//     if (!result.cancelled && onSend) {
//       onSend([{ image: result.uri }])
//     }
//     return result.uri
//   }
// }

export async function pickImageAsync(callback) {
  if (await getPermissionAsync(Permissions.MEDIA_LIBRARY)) {
    ImagePicker.launchImageLibrary({
      maxHeight: 150,
      mediaType: 'photo',
      maxWidth: 150
    }, callback);
  }
}

export async function takePictureAsync(callback) {
  if (await getPermissionAsync(Permissions.CAMERA)) {
    ImagePicker.launchCamera({
      mediaType: 'photo',
      maxHeight: 150,
      maxWidth: 200
    }, callback);
  }
}

export function showShortErrorMessage(message) {
  ToastAndroid.show(message, ToastAndroid.SHORT);
}

export function showLongErrorMessage(message) {
  ToastAndroid.show(message, ToastAndroid.LONG);
}