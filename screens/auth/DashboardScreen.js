import React, { Component } from "react";
import { 
    View,
    Text,
    StyleSheet,
    Button
} from "react-native";
import firebase from 'firebase';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CameraScreen from '../cam/CameraScreen';
import PredictionScreen from '../PredictionScreen';

const StackNavigator = createStackNavigator();

export class DashboardNavigation extends Component {
    render() {
        return (
            <NavigationContainer>
                <StackNavigator.Navigator initialRouteName="Dashboard">
                    <StackNavigator.Screen name="Dashboard" component={DashboardScreen} />
                    <StackNavigator.Screen name="Camera" component={CameraScreen} />
                    <StackNavigator.Screen name="Prediction" component={PredictionScreen} />
                </StackNavigator.Navigator>
            </NavigationContainer>
        );
    }
}

export class DashboardScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                {/* <Text>DashboardScreen</Text> */}
                <Button title="Open Camera" onPress={
                    // Navigate to camera screen
                    () => this.props.navigation.navigate('Camera')
                    } />
                <Button title="Sign out" onPress={
                    () => firebase.auth().signOut().then(function() {
                        // Sign-out successful.
                        }).catch(function(error) {
                        // An error happened.
                    })} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});