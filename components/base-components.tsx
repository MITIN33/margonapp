import * as React from 'react';
import { TextInputProps } from 'react-native';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button as RNEButton, Input as RNEInput } from 'react-native-elements';
import AppTheme, { Colors } from '../theme/AppTheme';


function Container(props) {
    const alignItems = props.center ? "center" : "baseline";
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: alignItems, padding: 10 }} {...props}>{props.children}</View>
}

function DisabledChatToolbar(props) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>You can not send message to this chat</Text></View>
}

function TextInput(props: TextInputProps) {
    return <RNEInput
        inputContainerStyle={{ borderWidth: 1, borderRadius: 5, paddingLeft: 15 }}
        inputStyle={{ marginTop: 0 }}
        returnKeyLabel='Done'
        returnKeyType='done'
        {...props} />
}

function Heading({ text }) {
    return <Text style={{ color: Colors.primary, fontSize: 30, fontWeight: 'bold', marginBottom: 30, marginTop: 30 }}>
        {text}
    </Text>
}

function Title({ text }) {
    return <Text style={{ color: Colors.primary, marginBottom: 5, alignSelf: 'flex-start', paddingLeft: 10, marginTop: 10 }}>
        {text}
    </Text>
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


export { Divider, Container, TextInput, Heading, Title, CompatibleView, DisabledChatToolbar }