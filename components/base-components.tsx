import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button as RNEButton, Input as RNEInput } from 'react-native-elements';


function Container(props) {
    const alignItems = props.center ? "center" : "baseline";
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: alignItems, padding: 10 }} {...props}>{props.children}</View>
}

function Button(props) {
    return <RNEButton containerStyle={[{ height: 40, justifyContent: "center", width: "100%", borderRadius: 5, margin: 20 }, props.style]} {...props}>
        {props.title}
    </RNEButton>;
}

function TextInput(props) {
    return <RNEInput inputStyle={{ marginTop: 0 }} returnKeyLabel='Done' returnKeyType='done' {...props} />
}

function CompatibleView(props) {
    if (Platform.OS === "ios") {
        return <KeyboardAvoidingView behavior='padding' {...props} />
    }
    else {
        return <View {...props} />
    }
}

function Divider(props) {
    return (
        <>
            {props.text ?
                <View style={{ flexDirection: "row", width: "85%" }}>
                    <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, flex: 1, alignSelf: "center" }}></View>
                    <Text style={{ alignSelf: "center", paddingHorizontal: 5 }}>{props.text}</Text>
                    <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, flex: 1, alignSelf: "center" }}></View>
                </View>
                :
                <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, width: "100%", marginTop: 20, marginBottom: 20 }}></View>
            }
        </>
    )
}


export { Button, Divider, Container, TextInput, CompatibleView }