import { Linking } from 'expo'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'

import { Alert } from 'react-native'
import { locationStore } from '../stores/LocationStore'
import storage from '@react-native-firebase/storage'
import { utils } from '@react-native-firebase/app'

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

export async function pickImageAsync(onSend) {
  if (await getPermissionAsync(Permissions.MEDIA_LIBRARY)) {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.cancelled && onSend) {
      onSend([{ image: result.uri }])
    }
    return result.uri
  }
}

export async function uploadMediaToFirestore() {
  if (await getPermissionAsync(Permissions.MEDIA_LIBRARY)) {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.cancelled) {
      console.log(`Uri: ${result.uri}`)
      //const pathToFile = `${ utils.FilePath.PICTURES_DIRECTORY } / name`;
      storage().ref(`/ messages / ${name}`).putFile(result.uri).then((response) => {
        console.log(response)
      })
    }
  }
}

export async function takePictureAsync(onSend) {
  if (await getPermissionAsync(Permissions.CAMERA)) {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.cancelled) {
      onSend([{ image: result.uri }])
      return result.uri
    }
  }
}