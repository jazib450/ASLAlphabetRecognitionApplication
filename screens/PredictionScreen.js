// import React, { Component } from "react";
// import { 
//     View,
//     Text,
//     StyleSheet,
//     Button,
//     Image
// } from "react-native";
// import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';
// import { decodeJpeg, fetch } from '@tensorflow/tfjs-react-native';
// import * as jpeg from 'jpeg-js';
// import * as FileSystem from 'expo-file-system';
// // You can try with other models, see https://github.com/tensorflow/tfjs-models
// import * as cocossd from '@tensorflow-models/coco-ssd';
// import Constants from 'expo-constants'
// import * as Permissions from 'expo-permissions'


// class PredictionScreen extends Component {
    
//     constructor(props) {
//         super(props);

//         this.state = {
//             isTfReady: false,
//             isModelReady: false,
//             predictions: null,
//             photo: this.props.route.params.photo,
//             prediction: ""
//         };
//     }

//     // async componentDidMount() {
//     //     await tf.ready(); // preparing TensorFlow
//     //     this.setState({ isTfReady: true,});
    
//     //     // this.model = await mobilenet.load(); // preparing MobileNet model
//     //     this.model = await cocossd.load(); // preparing COCO-SSD model
//     //     this.setState({ isModelReady: true });
    
//     //     this.getPermissionAsync(); // get permission for accessing camera on mobile device
//     // }

//     getPermissionAsync = async () => {
//         if (Constants.platform.ios) {
//             const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
//             if (status !== 'granted') {
//                 alert('Please grant camera roll permission for this project!')
//             }
//         }
//     }

//     getPrediction = async (URI) => {

//         this.setState({
//             prediction: "Loading Tensorflow..."
//         });
//         await tf.ready();
//         this.setState({
//             prediction: "Loading Model..."
//         });
//         //const model = await mobilenet.load();
//         const model = await cocossd.load();
//         // this.setState({
//         //     prediction: "Fetching Image..."
//         // });
//         // const response = await fetch(URI, {}, {isBinary: true});
//         // this.setState({
//         //     prediction: "Generating Image Data..."
//         // });
//         // const imageData = await response.arrayBuffer();
        
        
//         this.setState({
//             prediction: "Generating Image Tensor..."
//         });
//         const imageTensor = this.URItoTensor(URI);
//         //const imageTensor = this.imageToTensor(imageData);
//         this.setState({
//             prediction: "Classifying..."
//         });
//         //const prediction = await model.classify(imageTensor);
//         //const prediction = await model.classify(imageTensor);
//         const prediction = await model.detect(imageTensor);
//         this.setState({
//             prediction: JSON.stringify(prediction)
//         });

//         console.log('----------- predictions: ', this.state.prediction);
//         //console.log('----------- predictions: ', prediction);

//     }

//     URItoTensor = async URI => {
//         const imgB64 = await FileSystem.readAsStringAsync(URI, {
//             encoding: FileSystem.EncodingType.Base64,
//         });
//         const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
//         const raw = new Uint8Array(imgBuffer);
//         const imageTensor = this.imageToTensor(raw);
//         console.log('imageTensor: ', imageTensor);
//         return imageTensor;
//     }

//     imageToTensor(rawImageData) {
//         const TO_UINT8ARRAY = true
//         const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
//         // Drop the alpha channel info for mobilenet
//         const buffer = new Uint8Array(width * height * 3)
//         let offset = 0 // offset into original data
//         for (let i = 0; i < buffer.length; i += 3) {
//           buffer[i] = data[offset]
//           buffer[i + 1] = data[offset + 1]
//           buffer[i + 2] = data[offset + 2]
    
//           offset += 4
//         }
    
//         return tf.tensor3d(buffer, [height, width, 3])
//     }

//     detectObjects = async () => {
//         try {
//           const imageAssetPath = Image.resolveAssetSource(this.state.image)
    
//           console.log(imageAssetPath.uri);
//           const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
//               encoding: FileSystem.EncodingType.Base64,
//           });
//           const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
//           const raw = new Uint8Array(imgBuffer)
//           const imageTensor = this.imageToTensor(raw);
//           console.log('imageTensor: ', imageTensor);
//           const predictions = await this.model.detect(imageTensor)
    
//           this.setState({ predictions: predictions })
    
    
//           console.log('----------- predictions: ', predictions);
    
//         } catch (error) {
//           console.log('Exception Error: ', error)
//         }
//     }
    

//     render() {
//         return (
//             <View style={styles.container}>
//                 <Image 
//                     source=
//                     {{
//                         width: 200,
//                         height: 322,
//                         uri: this.state.photo.uri,
//                     }}
//                 />
//                 <Button title="Predict" onPress={
//                     // Navigate to camera screen
//                     () => this.getPrediction(this.state.photo.uri)
//                     } 
//                 />
//                 <Text> {this.state.prediction} </Text>
//             </View>
//         );
//     }
// }

// export default PredictionScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center'
//     }
// });


import React, { Component } from 'react';
import { 
  StyleSheet,
  Text, View,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Button
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';

import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'

import * as jpeg from 'jpeg-js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// import * as mobilenet from '@tensorflow-models/mobilenet'
// You can try with other models, see https://github.com/tensorflow/tfjs-models
import * as cocossd from '@tensorflow-models/coco-ssd'

export default class PredictionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTfReady: false,
      isModelReady: false,
      predictions: "",
      image: this.props.route.params.photo,
    };
  }

  async componentDidMount() {
    await tf.ready(); // preparing TensorFlow
    this.setState({ isTfReady: true,});

    // this.model = await mobilenet.load(); // preparing MobileNet model
    this.model = await cocossd.load(); // preparing COCO-SSD model
    this.setState({ isModelReady: true });

    this.getPermissionAsync(); // get permission for accessing camera on mobile device
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            alert('Please grant camera roll permission for this project!')
        }
    }
  }

  imageToTensor(rawImageData) {
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }

    return tf.tensor3d(buffer, [height, width, 3])
  }

  detectObjects = async () => {
    this.setState({
      predictions: "Detecting..."
    })

    try {
      const imageAssetPath = Image.resolveAssetSource(this.state.image)

      console.log(imageAssetPath.uri);
      const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
      	encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      const imageTensor = this.imageToTensor(raw);
      console.log('imageTensor: ', imageTensor);
      const predictions = await this.model.detect(imageTensor)

      if(predictions.length>0)
      {   
        this.setState({
          predictions: "Detected: " + JSON.stringify(predictions[0].class)
        })
      }
      else
      {
        this.setState({
          predictions: "Nothing detected"
        })
      }
      //console.log('----------- predictions: ', JSON.stringify(predictions));

    } catch (error) {
      console.log('Exception Error: ', error)
    }
  }

  /*
  [{
  bbox: [x, y, width, height],
  class: "person",
  score: 0.8380282521247864
  }, {
  bbox: [x, y, width, height],
  class: "kite",
  score: 0.74644153267145157
  }]
  */

  render() {
    const { isTfReady, isModelReady, predictions, image } = this.state
    
    return (
        <View style={styles.container}>
            <Image 
                source=
                {{
                    width: 200,
                    height: 322,
                    uri: this.state.image.uri,
                }}
            />
            {isModelReady && image && (
              <Button title="Predict" onPress={
                  () => isModelReady ? this.detectObjects() : undefined
                  } 
              />
            )}
            {!(isModelReady && image) && (
              <Text>Please wait...</Text>
            )}
            <Text style={styles.text}>
              {predictions}
            </Text>
        </View>
    );
  }
}

PredictionScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
  }
});