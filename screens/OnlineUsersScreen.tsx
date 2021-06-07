import React, { Component } from 'react';
import { Avatar } from 'react-native-elements'
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { dialogsStore } from '../stores/DialogsStore';
import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons'
import { Colors } from '../theme/AppTheme';

@observer
class OnlineUsersScreen extends Component<any, any> {

    /**
     *
     */
    constructor(props) {
        super(props)
    }

    renderItem = ({ item }) => (
        <View style={styles.userCardWrapper}>
            <Avatar onPress={() => this.onItemClick(item)}
                containerStyle={{ flex: 1, width: '100%', height: 170 }}
                overlayContainerStyle={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                avatarStyle={{ resizeMode: 'cover' }}
                source={{ uri: item.avatar }} />
            <View style={{ flex: 1, flexDirection: 'row', padding: 5, justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Robosto', fontWeight: 'bold', color: 'black', fontSize: 15 }}>{item.name}</Text>
                <Text style={{ fontFamily: 'Robosto', fontSize: 15 }}>{'2km'}</Text>
            </View>
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
                refreshControl={
                    <RefreshControl
                        refreshing={dialogsStore.isLoadingNearByUsers}
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


const styles = StyleSheet.create({
    userCardWrapper: {
        flex: 1,
        borderRadius: 5,
        elevation: 5,
        shadowColor: 'black',
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 10,
        marginTop: 10,
        backgroundColor: 'white'
    }
})