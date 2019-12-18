// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Import the Dialogflow module from the Actions on Google client library.
//const {dialogflow} = require('actions-on-google');

// Import the Dialogflow module and response creation dependencies from the 
// Actions on Google client library.
const {
    dialogflow,
    Permission,
    Suggestions,
    BasicCard
  } = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
/*app.intent('color favorito', (conv, {color}) => {
    const luckyNumber = color.length;
    // Respond with the user's lucky number and end the conversation.
    conv.close('Bien, tu número de la suerte es el ' + luckyNumber);
});*/
/*app.intent('color favorito', (conv, {color}) => {
    const luckyNumber = color.length;
    if (conv.data.userName) {
      conv.close(`${conv.data.userName}, tu número de la suerte es el ${luckyNumber}.`);
    } else {
      conv.close(`Bien, tu número de la suerte es el ${luckyNumber}.`);
    }
  });*/

  /*app.intent('color favorito', (conv, {color}) => {
    const luckyNumber = color.length;
    const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
    if (conv.data.userName) {
      // If we collected user name previously, address them by name and use SSML
      // to embed an audio snippet in the response.
      conv.close(`<speak>${conv.data.userName}, tu número de la suerte es el ` +
        `${luckyNumber}.<audio src="${audioSound}"></audio></speak>`);
    } else {
      conv.close(`<speak>Bien, tu número de la suerte es el ${luckyNumber}.` +
        `<audio src="${audioSound}"></audio></speak>`);
    }
   });*/

app.intent('color favorito', (conv, {color}) => {
    const luckyNumber = color.length;
    const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
    if (conv.user.storage.userName) {
      // If we collected user name previously, address them by name and use SSML
      // to embed an audio snippet in the response.
      conv.ask(`<speak>${conv.user.storage.userName}, tu número de la suerte es el ` +
        `${luckyNumber}.<audio src="${audioSound}"></audio> ` +
        `Te gustaría escuchar algunos colores falsos?</speak>`);
      conv.ask(new Suggestions('Si', 'No'));
    } else {
      conv.ask(`<speak>Bien, tu número de la suerte es el ${luckyNumber}.` +
        `<audio src="${audioSound}"></audio> ` +
        `Te gustaría escuchar algunos colores falsos?</speak>`);
      conv.ask(new Suggestions('Si', 'No'));
    }
   });

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
      context: 'Hola, para conocerte mejor',
      permissions: 'NAME',
    }));
  } else {
    conv.ask(`Hola de nuevo, ${name}. Cuál es tu color favorito?`);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
    if (!permissionGranted) {
      conv.ask(`Vale, no hay problema. Cuál es tu color favorito?`);
      conv.ask(new Suggestions('Azul', 'Rojo', 'Verde'));
    } else {
      conv.user.storage.userName = conv.user.name.display;
      conv.ask(`Gracias, ${conv.user.storage.userName}. Cuál es tu color favorito?`);
      conv.ask(new Suggestions('Azul', 'Rojo', 'Verde'));
    }
  });

// Define a mapping of fake color strings to basic card objects.
const colorMap = {
  'taco indigo': {
    title: 'Indigo Taco',
    text: 'Indigo Taco is a subtle bluish tone.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
      accessibilityText: 'Indigo Taco Color',
    },
    display: 'WHITE',
  },
  'unicornio rosa': {
    title: 'Pink Unicorn',
    text: 'Pink Unicorn is an imaginative reddish hue.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
      accessibilityText: 'Pink Unicorn Color',
    },
    display: 'WHITE',
  },
  'cafe gris azulado': {
    title: 'Blue Grey Coffee',
    text: 'Calling out to rainy days, Blue Grey Coffee brings to mind your favorite coffee shop.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
      accessibilityText: 'Blue Grey Coffee Color',
    },
    display: 'WHITE',
  },
};

// Handle the Dialogflow intent named 'favorite fake color'.
// The intent collects a parameter named 'fakeColor'.
app.intent('favorite fake color', (conv, {fakeColor}) => {
  // Present user with the corresponding basic card and end the conversation.
  conv.close(`Aquí está el color`, new BasicCard(colorMap[fakeColor]));
});

// Handle the Dialogflow NO_INPUT intent.
// Triggered when the user doesn't provide input to the Action
app.intent('actions_intent_NO_INPUT', (conv) => {
  // Use the number of reprompts to vary response
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    conv.ask('Sobre que color te gustaría escuchar?');
  } else if (repromptCount === 1) {
    conv.ask(`Por favor, dime el nombre de un color`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    conv.close(`Lo siento, hemos tenido problemas, ` +
      `intentalo de nuevo luego. Hasta pronto.`);
  }
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
