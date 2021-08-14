import { TextInput, StyleSheet, View } from "react-native";
import React, { Component } from "react";
import { Colors } from "../theme/AppTheme";

export interface OTPProps {
    count: number;
    onChangeText: (text) => void;
}

export default class OTPBox extends Component<OTPProps> {
    private textInputRef: TextInput[] = [];
    private values: string[] = [];

    render() {
        const { count } = this.props;
        const onChangeText = (text: string, index) => {
            this.values[index] = text;
            if (text.length > 0 && index < count - 1)
                this.textInputRef[index + 1].focus();
            this.props.onChangeText(this.values.join(''));
        };

        const handleRef = (ref, index) => {
            this.textInputRef[index] = ref;
        };

        const handleBackSpace = (event, index) => {
            event.preventDefault();
            if (index > 0 && event.nativeEvent.key == "Backspace") {
                this.values[index] = '';
                this.props.onChangeText(this.values.join(''));
                if (index === count - 1)
                    this.textInputRef[index].clear();
                this.textInputRef[index - 1].focus();
            }
        }
        const elements = [];
        for (let i = 0; i < count; i++) {
            elements.push(<TextInput
                ref={(ref => handleRef(ref, i))}
                onChangeText={(text) => onChangeText(text, i)}
                style={style.otpBoxInputContainerStyle}
                returnKeyType='done'
                keyboardType='numeric'
                key={i} maxLength={1}
                onKeyPress={(event) => handleBackSpace(event, i)}
                // autoFocus={i === 0 ? true : undefined}
            />);
        }
        return (
            <View style={{ flexDirection: 'row' }}>
                {elements}
            </View>
        );
    };

    public getValue() {
        return this.values.join();
    }
}

const style = StyleSheet.create({
    otpBoxInputContainerStyle: {
        width: 40,
        height: 50,
        fontSize: 20,
        margin: 5,
        borderWidth: 1,
        borderRadius: 4,
        textAlign: 'center',
        borderColor: Colors.primary
    }
});