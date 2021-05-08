import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, ListItem, Image, Text, Badge } from 'react-native-elements';
import { Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';

const list = [
    {
        name: 'Amy Farha',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        short_text: 'Vice President',
        time: '6:78 PM'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        short_text: 'Vice Chairman of united states',
        time: '6:78 PM'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://mypollstorge.blob.core.windows.net/userimages/Description-Image-0746e0d1-1592-464c-bab6-ab863b417a40.jpeg',
        short_text: 'Vice Chairman',
        time: '6:78 PM'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        short_text: 'Vice Chairman',
        time: '6:78 PM'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        short_text: 'Vice Chairman',
        time: '6:78 PM'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        short_text: 'Vice Chairman',
        time: '11/11/2020'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        short_text: 'Vice Chairman',
        time: '14/11/2021'
    },
    {
        name: 'Chris Jackson',
        avatar_url: 'https://mypollstorge.blob.core.windows.net/userimages/Description-Image-0746e0d1-1592-464c-bab6-ab863b417a40.jpeg',
        short_text: 'Vice Chairman',
        time: '6:78 PM'
    }
]

const access = () => <Icon name='ellipsis-vertical-outline' type='ionicon' />;

class HomeScreen extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ScrollView>
                <View>
                    {
                        list.map((l, i) => (
                            <ListItem key={i} bottomDivider onPress={() => this.props.navigation.navigate('Chat')}>
                                <Avatar source={{ uri: l.avatar_url }} rounded >
                                    {i % 4 == 0 ? <Avatar.Accessory source={require('../assets/online-image.png')} /> : null}
                                </Avatar>
                                <ListItem.Content>
                                    <ListItem.Title>{l.name}</ListItem.Title>
                                    <ListItem.Subtitle>{l.short_text}</ListItem.Subtitle>
                                </ListItem.Content>
                                <View style={{ justifyContent: 'flex-end' }}>
                                    {i % 4 == 0 ? <Badge value={3} /> : null}
                                    <Text style={styles.ratingText}>{l.time}</Text>
                                </View>
                            </ListItem>
                        ))
                    }
                </View>
            </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    subtitleView: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingTop: 5
    },
    ratingImage: {
        height: 19.21,
        width: 100
    },
    ratingText: {
        fontSize: 12,
        color: 'grey',
        marginTop: 5
    }
});

export default HomeScreen;