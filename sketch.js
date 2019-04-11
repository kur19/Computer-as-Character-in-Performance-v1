/*jshint esversion: 6 */

// variable used to get objects to top level
var der;

let agent = { started: false };
// define listener to be able to reset it
let listener;

// if selffeedback mode, then use continuous listening
let selfFeedback = false;


function setup() {
    noCanvas();
    console.log("in standby mode, click mouse to start system!");
}

function draw() {
    let node = document.querySelector('#agent_status');

    node.innerText = agent.state;
}





function mousePressed() {
    if (agent.started) {
        startListener();
    } else {
        speechSetup();
    }
}

// start the listener
function startListener() {
    if (agent.state !== 'listening' && agent.state !== 'speaking') {
        console.log("started listener");
        listener.start();
    }
}

function speechSetup() {
    agent.started = true;
    listener = new p5.SpeechRec('en-US', gotSpeech);
    let speech = new p5.Speech();
    let continuous = false;

    if (selfFeedback) {
        continuous = true;
        console.log("self feedback mode is on");
    }

    let interim = false;

    listener.continuous = continuous;
    listener.interim = interim;


    // ***********************CALLBACK FUNCTIONS*****************************



    listener.onStart = function() {
        console.log("I am listening...");
        agent.state = 'listening';
    };
    listener.onEnd = function() {
        console.log("I stopped listening!!!!!!!");
        console.log(listener.resultValue);
        if (!selfFeedback) { agent.state = undefined; }
        if (listener.resultValue === undefined) { startListener(); }
    };

    // function to execute when speaking starts
    speech.onStart = function() {
        console.log("started talking...");
    };

    // function to execute when speaking stops
    speech.onEnd = function() {
        console.log("stopped talking...");
        if (!selfFeedback) { agent.state = undefined; }
        // restart listener
        if (!selfFeedback) {
            startListener();
            console.log("stop talking, start listening");
            listener.resultValue = undefined;
        }

    };



    // ***********************RIVE BOT*****************************

    let bot = new RiveScript();

    bot.loadFile("brain.rive").then(brainReady).catch(brainError);

    function brainReady() {
        console.log('Chatbot ready to play!');
        bot.sortReplies();
    }
    function brainError() {
        console.log('Chatbot error!');
    }

    let user_input = select('#user_input');
    let output = select('#output');



    let silenceCheckTimer;

    function gotSpeech() {
        if (listener.resultValue) {

            // get user spoken string and pass along
            let input = listener.resultString;
            console.log(input);
            user_input.html(input);

            // get the reply from rive script
            // then hand it to the synthesizer
            bot.reply("local-user", input).then(function(reply) {
                agent.state = 'speaking';
                listener.rec.abort();
                speech.speak(reply);
                output.html(reply);
                console.log(reply);
            });
        }
    }


    // START THE PROCESS!!!!
    startListener();

}





let kickoffStatements = [
    "where did you go?",
    "relax I'm still here."

];
