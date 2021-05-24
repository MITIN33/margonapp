import React, { Component } from 'react';
import { ListItem, Avatar } from 'react-native-elements'
import { FlatList, RefreshControl } from 'react-native';
import { margonAPI } from '../api/margon-server-api';
import { locationStore } from '../stores/LocationStore';

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
        <ListItem bottomDivider onPress={() => this.onItemClick(item)}>
            <Avatar rounded source={{ uri: item.avatar }} />
            <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
            </ListItem.Content>
        </ListItem>
    )


    onRefresh: () => void;

    private onItemClick(item) {
        this.props.navigation.navigate('Chat', {
            name: item.name,
            otherUserId: item._id,
            photoUrl: item.avatar
        })
    }


    componentDidMount() {
        this.setState({ isLoading: true })
        locationStore.getCurrentLocationAsync()
            .then((location) => {
                if (location) {
                    margonAPI.NearbyUsers(location.coords.longitude, location.coords.latitude)
                        .then((response) => {
                            if (response.data) {
                                var users = response.data['items']
                                this.setState({ userList: users })
                            }
                        })
                        .finally(() => {
                            this.setState({ isLoading: false })
                        })
                }
            })
            .catch((ex) => { console.error(ex.Messsage) })
            .finally(() => {
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