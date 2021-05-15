echo 'Started bundling android app'
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
echo 'Finished bundling android app'

cd android

echo 'Generating APK'
gradlew assembleDebug
echo 'Finished Generating APK'
