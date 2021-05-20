import React, { Component } from 'react';
import { ListItem, Avatar } from 'react-native-elements'
import { FlatList, RefreshControl } from 'react-native';
import { margonAPI } from '../api/margon-server-api';

class OnlineUsersScreen extends Component<any, any> {


    /**
     *
     */
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            userList: []
        }
    }

    renderItem = ({ item }) => (
        <ListItem bottomDivider onPress={() => this.props.navigation.navigate('Chat', { name: item.name, otherUserId: item._id, photoUrl: item.avatar })}>
            <Avatar rounded source={{ uri: item.avatar }} />
            <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
            </ListItem.Content>
        </ListItem>
    )


    onRefresh: () => void;


    componentDidMount() {
        this.setState({ isLoading: true })
        margonAPI.NearbyUsers()
            .then((response) => {
                if (response.data) {
                    var users = response.data['items']
                    this.setState({ userList: users })
                }
            })
            .then(() => {
                this.setState({ isLoading: false })
            })
    }

    render() {
        return (
            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isLoading}
                        onRefresh={this.onRefresh}
                    />}
                keyExtractor={(item) => item._id}
                data={this.state.userList}
                renderItem={this.renderItem}
            />
        )
    }
}

export default OnlineUsersScreen;