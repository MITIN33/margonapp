import React from "react";
import { View } from "react-native";
import { Text } from "react-native-elements";
import { ListItem } from "react-native-elements";
import { MgListItem } from "../models/chat-models";


interface IMgListProps {
    title?: string,
    listItems: MgListItem[],
}

class MgList extends React.Component<IMgListProps, any> {

    render() {
        return (
            <View>
                <Text style={{ marginLeft: 10, marginTop: 20, marginBottom: 5 }}>{this.props.title}</Text>
                {
                    this.props.listItems.map((item, i) => (
                        <ListItem key={i} bottomDivider onPress={item.action}>
                            <ListItem.Content>
                                <ListItem.Title>{item.title}</ListItem.Title>
                                {item.Subtitle && <ListItem.Subtitle>{item.Subtitle()}</ListItem.Subtitle>}
                            </ListItem.Content>
                            {item.renderRightWidget && item.renderRightWidget()}
                        </ListItem>
                    ))
                }
            </View >
        )
    }
}

export default MgList;