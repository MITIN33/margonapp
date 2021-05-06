import React, { Component } from 'react';
import { userstore } from '../stores/UserStore';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Container } from '../components/base-components';

class ChatHistory extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            text: "Initial Text"
        }
    }

    componentDidMount() {
        this.setState({ text: "Hello from History screen" });
    }

    render() {

        const { text } = this.state;
        return (
            <Container center>
                <Text>{text}</Text>
                <Button onPress={userstore.Logout} mode="contained" >Logout</Button>
            </Container>
        );
    }
}

export default ChatHistory;