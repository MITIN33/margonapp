import { observer } from "mobx-react";
import React from "react";
import { Alert } from "react-native";
import { Icon, ListItem } from "react-native-elements";
import { Overlay } from "react-native-elements";
import { chatStore } from "../stores/ChatStore";
import { dialogsStore } from "../stores/DialogsStore";
import { userstore } from "../stores/UserStore";

@observer
class ChatContextMenu extends React.Component<any, any> {

    /**
     *
     */
    constructor(props) {
        super(props)
        this.state = {
            showContextMenu: false
        }
    }

    componentDidMount() {
        let isblocked = dialogsStore.selectedDialog.blockedByUserIds && dialogsStore.selectedDialog.blockedByUserIds.includes(userstore.user.userId);
        this.setState({
            isBlocked: isblocked
        })
    }

    toggleContextMenu = () => {
        this.setState({ showContextMenu: !this.state.showContextMenu })
    }

    onHandleBlockAction() {
        let title = dialogsStore.selectedDialog.blockedByUserIds.findIndex(x => x === userstore.user.userId) > -1 ? 'Unblock' : 'Block';
        this.toggleContextMenu();
        Alert.alert(title, `Are you sure you want to ${title.toLowerCase()} this user?`, [
            {
                text: "Cancel",
                onPress: () => { }
            },
            {
                text: "Yes", onPress: () => {
                    chatStore.blockUnBlockUser(() => this.setState({ isBlocked: !this.state.isBlocked }));
                }

            }
        ]);
    }

    onHandleClearChatAction() {
        this.toggleContextMenu();
        Alert.alert("Clear Chat", 'Are you sure you want to clear chat?', [
            {
                text: "Cancel",
                onPress: () => { }
            },
            {
                text: "Yes", onPress: () => {
                    chatStore.clearChat();
                }

            }
        ]);
    }

    onHandleExitAction() {
        this.toggleContextMenu();
        Alert.alert("Exit Chat", 'Are you sure you want to exit chat?', [
            {
                text: "Cancel",
                onPress: () => { }
            },
            {
                text: "Yes", onPress: () => {
                    chatStore.exitChat(() => {
                        this.props.navigation.navigate('Home')
                    });
                }

            }
        ]);
    }

    render() {

        let menuItems = [
            {
                title: 'Clear Chat',
                action: () => this.onHandleClearChatAction()
            },
            {
                title: this.state.isBlocked ? 'Unblock' : 'Block',
                action: () => this.onHandleBlockAction()
            },
            {
                title: 'Exit Chat',
                action: () => this.onHandleExitAction()
            }
        ]

        return <>
            <Overlay
                statusBarTranslucent
                transparent
                animationType='fade'
                backdropStyle={{ backgroundColor: 'transparent' }}
                overlayStyle={{ position: 'absolute', top: 50, right: 20, width: 150, padding: 0 }}
                isVisible={this.state.showContextMenu}
                onBackdropPress={this.toggleContextMenu}
            >
                {menuItems.map((item, i) => (
                    <ListItem key={i} bottomDivider onPress={item.action}>
                        <ListItem.Content>
                            <ListItem.Title>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}

            </Overlay>
            <Icon containerStyle={{ marginRight: 10 }} name='ellipsis-vertical-outline' type='ionicon' onPress={this.toggleContextMenu} />
        </>
    }
}

export default ChatContextMenu;