import { Provider } from 'mobx-react';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Button, Container, Divider } from '../components/base-components';

class StatusScreen extends Component<any, any> {


    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    render() {
        return (
                <Container>
                    
                </Container>
        );
    }
}

export default StatusScreen;