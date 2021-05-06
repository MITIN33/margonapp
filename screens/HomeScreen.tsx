import React, { Component } from 'react';
import { userstore } from '../stores/UserStore';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Button, Divider, Container } from '../components/base-components';

class HomeScreen extends Component {


    render() {
        return (
            <Container center>
                <TextInput label="UserName" returnKeyLabel='Done' returnKeyType='done' style={{ width: "90%" }} mode="outlined" />
            </Container>
        );
    }


    private UserLogout = () => {
        userstore.Logout();
    }
}

export default HomeScreen;