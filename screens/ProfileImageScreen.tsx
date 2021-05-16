import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { View } from 'react-native';
import { userstore } from '../stores/UserStore';
import { Avatar } from 'react-native-elements';

@observer
class ProfileImageScreen extends Component<any, any> {
   
    constructor(props) {
        super(props);
       
        this.state = {
            isLoading: false
        }
    }

    render() {
        const currentUserPic = this.props.route.params;
        return (
                <View style={{flex:1, width: '100%'}}>
                  <Avatar containerStyle={{flex:1, width:'100%'}} avatarStyle={{ resizeMode: 'contain'}} source={{ uri: currentUserPic }} />
                </View>
        );
    }
}

export default ProfileImageScreen;