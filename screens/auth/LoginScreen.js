import React, { Component } from "react";
import { 
    View,
    Text,
    StyleSheet,
    Button
} from "react-native";
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';

class LoginScreen extends Component {
    
  // Function to check if the user is already logged in
    isUserEqual = (googleUser, firebaseUser) => {
      if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
          if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
              providerData[i].uid === googleUser.getBasicProfile().getId()) {
            // We don't need to reauth the Firebase connection.
            return true;
          }
        }
      }
      return false;
    }

    // Function to log the user in to google
    onSignIn = (googleUser) => {
      //console.log('Google Auth Response', googleUser);    // Useful to see this
      // We need to register an Observer on Firebase Auth to make sure auth is initialized.
      var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(googleUser, firebaseUser)) {
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
              googleUser.idToken,
              googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase.auth().signInWithCredential(credential).then(
            function(){
              // If the account does not already exist in firebase, create a new account in firebase
              // Otherwise, update the existing account on firebase if necessary
              firebase.database().ref('/users/' + googleUser.user.id).once("value").then(
                function(snapshot)
                {
                  var a = snapshot.exists();
                  if(a)
                  {
                    //console.log("Existing User");
                    firebase
                    .database()
                    .ref('/users/' + googleUser.user.id)
                    .update({
                      last_logged_in: Date.now()
                    })
                  }
                  else
                  {
                    // console.log("New User");
                    firebase
                    .database()
                    .ref('/users/' + googleUser.user.id)
                    .set({
                      gmail: googleUser.user.email,
                      profile_picture: googleUser.user.photoUrl,
                      first_name: googleUser.user.givenName,
                      last_name: googleUser.user.familyName,
                      account_created: Date.now(),
                      last_logged_in: Date.now()
                    })
                    .then(function(snapshot){
                      // console.log(snapshot);
                    });
                  }
                }
              );
            }
          ).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
        } else {
          console.log('User already signed-in Firebase.');
        }
      }.bind(this));
    }
    signInWithGoogleAsync = async () => {
        try {
          const result = await Google.logInAsync({
            behavior: 'web',
            androidClientId: '627827009439-b02mv69feeo60vt33s5qil96rsjq8doe.apps.googleusercontent.com',
            iosClientId: '627827009439-0deu28ef9gge5ef5kqd888upt6ob9dvi.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
          });
      
          if (result.type === 'success') {
            this.onSignIn(result);
            return result.accessToken;
          } else {
            return { cancelled: true };
          }
        } catch (e) {
          return { error: true };
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Button title="Login with Google" onPress={() => {
              return this.signInWithGoogleAsync();
            }}/>
            </View>
        );
    }
}
export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});