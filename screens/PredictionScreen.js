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
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

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
    // this.model = await cocossd.load(); // preparing COCO-SSD model

    // console.log("[+] Loading custom ASL model");
    const modelJson = await require("../assets/model/model.json");
    const modelWeight = await require("../assets/model/group1-shard.bin");
    this.model = await tf.loadLayersModel(bundleResourceIO(modelJson,modelWeight));
    // console.log("[+] Loaded custom ASL model");
    
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

      // console.log(imageAssetPath.uri);
      const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
      	encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      const imageTensor = this.imageToTensor(raw);
      // console.log('imageTensor: ', imageTensor);
      const resizedImageTensor = imageTensor.resizeBilinear([64, 64]).reshape([1, 64, 64, 3]);
      // console.log('Resized imageTensor: ', resizedImageTensor);
      // const predictions = await this.model.detect(imageTensor)
      const predictions = await this.model.predict(resizedImageTensor).data();
      if(predictions.length>0)
      {   
        // this.setState({
        //   predictions: "Detected: " + JSON.stringify(predictions[0].class)
        // })
        this.setState({
          predictions: "Detected: " + this.predictionsToLetter(predictions)
        });
      }
      else
      {
        this.setState({
          predictions: "Nothing detected"
        })
      }
      //console.log('Predictions: ', JSON.stringify(predictions));

    } catch (error) {
      console.log('Exception Error: ', error)
    }
  }

  predictionsToLetter(predictions) {
    var letter = "";
    var maxConfidence = 0;
    var maxConfidenceLocation;
    
    for (let i = 0; i < predictions.length; i++) {
      if(predictions[i] > maxConfidence)
      {
        maxConfidence = predictions[i];
        maxConfidenceLocation = i;
      }
    }

    var numToAlphabetDictionary = {
      1: "A",
      2: "B",
      3: "C",
      4: "D",
      5: "E",
      6: "F",
      7: "G",
      8: "H",
      9: "I",
      10: "J",
      11: "K",
      12: "L",
      13: "M",
      14: "N",
      15: "O",
      16: "P",
      17: "Q",
      18: "R",
      19: "S",
      20: "T",
      21: "U",
      22: "V",
      23: "W",
      24: "X",
      25: "Y",
      26: "Z",
      27: "del",
      28: "nothing",
      29: "space"
    };

    letter = numToAlphabetDictionary[maxConfidenceLocation + 1];

    return letter;
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
                    width: this.state.image.width,
                    height: this.state.image.height,
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