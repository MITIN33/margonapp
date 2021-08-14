import React from "react"
import { RefreshControl, StatusBar, View } from "react-native";
import { ListItem, Avatar, Badge } from "react-native-elements";
import { ScrollView } from "react-native-gesture-handler";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { margonAPI } from "../api/margon-server-api";
import { dialogsStore } from "../stores/DialogsStore";

export default class BlockedScreen extends React.Component<any, any> {


    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            dialogs: []
        }
    }

    componentDidMount() {
        this.loadBlockedList();
    }

    render() {

        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={dialogsStore.isDialogLoading}
                        onRefresh={this.loadBlockedList}
                    />}
            >
                <StatusBar backgroundColor={Colors.themeColor} />
                <View>
                    {
                        this.state.dialogs.slice().map((dialog, i) => (
                            <ListItem key={i} bottomDivider
                                onPress={() => {
                                    this.props.navigation.navigate('Chat', dialog)
                                }}>
                                <Avatar source={{ uri: dialog.photoUrl }} rounded>
                                    {(dialog.isUserOnline && dialog.blockedByUserIds && dialog.blockedByUserIds.length == 0) ? <Avatar.Accessory source={require('../assets/online-image.png')} /> : null}
                                </Avatar>
                                <ListItem.Content>
                                    <ListItem.Title>{dialog.name}</ListItem.Title>
                                </ListItem.Content>
                            </ListItem>
                        ))
                    }
                </View>
            </ ScrollView>

        );
    }

    private loadBlockedList = () => {
        this.setState({ isLoading: true });
        margonAPI.GetBlockedUserList()
            .then((response) => {
                let dialogs = response.data['items'];
                this.setState({ dialogs: dialogs });
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })

    }
}