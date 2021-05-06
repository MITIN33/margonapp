import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { Text, View } from 'react-native';
import { Button as PaperButton, TextInput as PaperInput } from 'react-native-paper';


function Container(props) {
    const alignItems = props.center ? "center" : "baseline";
    return <View style={{ flex: 1, alignItems: alignItems, padding: 10 }} {...props}>{props.children}</View>
}

function Button(props) {
    const { colors } = useTheme();
    return <PaperButton color={colors.primary} mode={props.mode} style={[{ height: 40, justifyContent: "center", width: "100%", borderRadius: 5, margin: 20 }, props.style]} {...props}>
        {props.title}
    </PaperButton>;
}

function TextInput(props){
    return <PaperInput label={props.label} returnKeyLabel='Done' returnKeyType='done' style={{ width: "100%", marginTop: 20, height: 50 }} mode={props.mode} {...props} />
}


function Divider(props) {
    return (
        <>
            {props.text ?
                <View style={{ flexDirection: "row", width: "85%", marginBottom: 10 }}>
                    <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, flex: 1, alignSelf: "center" }}></View>
                    <Text style={{ alignSelf: "center", paddingHorizontal: 5 }}>{props.text}</Text>
                    <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, flex: 1, alignSelf: "center" }}></View>
                </View>
                :
                <View style={{ borderColor: 'lightgrey', borderBottomWidth: 1, width: "85%" }}></View>
            }
        </>
    )
}


export { Button, Divider, Container, TextInput }