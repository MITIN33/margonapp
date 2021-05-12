import React, { Component } from 'react';
import { userstore } from '../stores/UserStore';
import { Text } from 'react-native';
import { Container } from '../components/base-components';
import { Button } from 'react-native-elements';

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
                <Button onPress={userstore.Logout} title={"Logout"}></Button>
            </Container>
        );
    }
}

export default ChatHistory;