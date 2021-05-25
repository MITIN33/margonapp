import React, { Component } from 'react';
import { ListItem, Avatar, Card, Image } from 'react-native-elements'
import { FlatList, RefreshControl, Text, View } from 'react-native';
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
        <Card>
            <View>
                <Image onPress={() => this.onItemClick(item)} resizeMode='contain' style={{ width: 100, height: 100 }} source={{ uri: item.avatar }} />
                <Text>{item.name}</Text>
            </View>
        </Card>
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
                scrollEnabled
                numColumns={2}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => dialogsStore.loadNearByUsers()}
                    />}
                keyExtractor={(item) => item._id}
                data={dialogsStore.nearByUsers}
                renderItem={this.renderItem}
            />
        )
    }
}

export default OnlineUsersScreen;