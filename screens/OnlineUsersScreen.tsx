import React, { Component } from 'react';
import { ListItem, Avatar, Card, Image } from 'react-native-elements'
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { dialogsStore } from '../stores/DialogsStore';
import { observer } from 'mobx-react';

@observer
class OnlineUsersScreen extends Component<any, any> {


    /**
     *
     */
    constructor(props) {
        super(props)
    }

    renderItem = ({ item }) => (
        <View style={{ flex: 1, borderRadius: 10, elevation: 5, shadowColor: 'black', marginLeft: 5, marginRight: 5, marginBottom: 10, marginTop: 10, backgroundColor: 'white' }}>
            <Avatar onPress={() => this.onItemClick(item)}
                containerStyle={{ flex: 1, width: '100%', height: 170 }}
                overlayContainerStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                avatarStyle={{ resizeMode: 'cover' }}
                source={{ uri: item.avatar }} />
            <Text style={{ fontWeight: 'bold', padding: 5, fontSize: 15 }}>{item.name}</Text>
        </View>
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
        dialogsStore.loadNearByUsers();
    }

    render() {
        return (
            <FlatList
                style={{ backgroundColor: 'white', height: 50 }}
                scrollEnabled
                numColumns={2}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={dialogsStore.loadNearByUsers}
                    />}
                keyExtractor={(item) => item._id}
                data={dialogsStore.nearByUsers}
                renderItem={this.renderItem}
            />
        )
    }
}

export default OnlineUsersScreen;