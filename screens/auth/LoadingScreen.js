import React, { Component } from "react";
import { 
    View,
    Text,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import firebase from 'firebase';

class LoadingScreen extends Component {

    componentDidMount(){
        this.checkIfLoggedIn();
    }
    
    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(
            function(user){
                if(user)
                {
                    // User is logged in, take them to dashboard screen
                    this.props.navigation.navigate('DashboardScreen');
                }
                else{
                    // User is not logged in, take them to login screen
                    this.props.navigation.navigate('LoginScreen');
                }
            }.bind(this)
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size='large' />
            </View>
        );
    }
}
export default LoadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})