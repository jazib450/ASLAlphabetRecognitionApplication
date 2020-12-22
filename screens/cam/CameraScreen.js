import React, {Component} from 'react';
import { 
    View,
    Text,
    StyleSheet,
    Button,
    TouchableOpacity
} from "react-native";
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


class CameraScreen extends Component {

    state = {
        hasPermission: null,
        type: Camera.Constants.Type.front
    }

    async componentDidMount() {
        //this.checkIfLoggedIn();
        this.getPermissionAsync();
    }

    getPermissionAsync = async () => {
        // Camera roll Permission 
        if (Platform.OS === 'ios') {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
        // Camera Permission
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasPermission: status === 'granted' });
        // console.log(await this.camera.getAvailablePictureSizesAsync("16:9"));
    }

    handleCameraType = () => {
        const { cameraType } = this.state.type
    
        this.setState({cameraType:
          cameraType === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
        })
    }

    takePicture = async () => {
        if (this.camera) {
            //let photo = await this.camera.takePictureAsync({base64: true});
            let photo = await this.camera.takePictureAsync();
            /* Photo Properties:
                URI: The full path to the taken photo file in the device, where its stored
                Height: The height of the photo
                Width: The width of the photo
                base64: if you set the base64 parameter in the takePictureAsync function, it will retrieve JPEG data for the image.
                exif: if you set the exif parameter in the takePictureAsync function, it will retrieve EXIF data for the image.
            */
           //console.log(photo);
           this.props.navigation.navigate('Prediction',
           {
               photo
           });
        }
    }
    
    pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });
    }

    render() {
        const { hasPermission } = this.state;
        if (hasPermission === null) {
            return <View />;
        }
        else if (hasPermission === false) {
            return <Text>No access to camera</Text>;
        }
        else {
            return (
                <View
                    style={styles.camera}
                >
                    <Camera
                        style={{ flex: 1 }}
                        type={this.state.type}
                        ref={ref => {this.camera = ref}}
                        pictureSize={"352x288"}
                        // pictureSize="640x480"
                    >
                        <View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:50}}>
                            {/* <TouchableOpacity
                                style={{
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                                backgroundColor: 'transparent',                  
                                }}
                                onPress={()=>this.pickImage()}
                            >
                                <Ionicons
                                    name="ios-photos"
                                    style={{ color: "#fff", fontSize: 40}}
                                />
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                style={{
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                                backgroundColor: 'transparent',
                                }}
                                onPress={()=>this.takePicture()}
                            >
                                <FontAwesome
                                    name="camera"
                                    style={{ color: "#fff", fontSize: 40}}
                                />
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                                style={{
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                                backgroundColor: 'transparent',
                                }}
                                onPress={()=>this.handleCameraType()}
                            >
                                <MaterialCommunityIcons
                                    name="camera-switch"
                                    style={{ color: "#fff", fontSize: 40}}
                                />
                            </TouchableOpacity> */}
                        </View>
                    </Camera>
                </View>
            );
        }
    }
}
export default CameraScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    camera: {
        width: 500,
        height: 500
    }
})