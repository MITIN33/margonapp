import React, { Component } from 'react';
import { Tab } from 'react-native-elements';
import { Container } from '../components/base-components';

class StatusScreen extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Tab>
                <Tab.Item title="Status" />
                <Tab.Item title="Online" active />
                <Tab.Item title="Chats" />
            </Tab>
        );
    }
}

export default StatusScreen;