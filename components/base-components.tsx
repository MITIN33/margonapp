import * as React from 'react';
import { TextInputProps } from 'react-native';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button as RNEButton, Input as RNEInput } from 'react-native-elements';
import AppTheme from '../theme/AppTheme';


function Container(props) {
    const alignItems = props.center ? "center" : "baseline";
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: alignItems, padding: 10 }} {...props}>{props.children}</View>
}

function Button(props) {
    return <RNEButton containerStyle={[{ height: 40, justifyContent: "center", width: "100%", borderRadius: 5, margin: 20 }, props.style]} {...props}>
        {props.title}
    </RNEButton>;
}

function TextInput(props: TextInputProps) {
    return <RNEInput
        inputContainerStyle={{ borderWidth: 1, borderRadius: 5, borderColor: AppTheme.colors.themeColor, paddingLeft: 15 }}
        inputStyle={{ marginTop: 0 }}
        returnKeyLabel='Done'
        returnKeyType='done'
        {...props} />
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