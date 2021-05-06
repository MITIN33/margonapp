import { View, Text } from "react-native";
import React from "react";
import { Container } from "../components/base-components";

class ChatScreen extends React.Component {
    render() {
        return (
            <Container>
                <Text>Hello this is your first chat message</Text>
            </Container>
        );
    }
}

export default ChatScreen;