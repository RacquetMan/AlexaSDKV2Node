/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const http = require ('http');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World from AWS!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('weather', speechText)
      .getResponse();
  },
};

const weatherHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'weather'
     && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  async handle(handlerInput) {
    const speechText = 'The temperature in ';
    const myrequest = handlerInput.requestEnvelope.request;
    const updatedIntent = myrequest.intent;
    const currentSlot = updatedIntent.slots['location'];
    
    

     if (!currentSlot.value) {
       console.log(currentSlot,'weather');
      return handlerInput.responseBuilder
      .addDelegateDirective(updatedIntent)
      .getResponse();
      }
      console.log(currentSlot);
      
      
      const getWeather = () => new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openweathermap.org',
      path: '/data/2.5/weather?q='+currentSlot.value+',us&units=imperial&APPID=ef5bcf9c9107c30072fcf67065bbde00',
      method: 'GET',
    };

    http.get(options, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          console.log(`Inside end listener. Logging out parsedData`, parsedData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    });
})
      
    
     const response = await getWeather()
console.log(`response from getWeahter`, response)

       var temp = response.main.temp;
       console.log(temp);

      console.log('TEMP******:',+ temp);
      return handlerInput.responseBuilder
      .speak(speechText+currentSlot.value+' is '+ temp + ' degrees.  Another city?')
      .withSimpleCard('Weather', speechText)
      .addElicitSlotDirective('location', updatedIntent)
      .reprompt('what city?')
     // .withShouldEndSession(false)
      .getResponse();
   
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    weatherHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
