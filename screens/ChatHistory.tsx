import React, { Component } from 'react';
import { userstore } from '../stores/UserStore';
import { Text } from 'react-native';
import { Container } from '../components/base-components';
import { Button } from 'react-native-elements';

class ChatHistory extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <Container center>
            </Container>
        );
    }
}

export default ChatHistory;