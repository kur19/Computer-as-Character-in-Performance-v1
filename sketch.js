/*jshint esversion: 6 */

// variable used to get objects to top level
var der;

let agent = {};

let selfFeedback = false;


function setup() {
    noCanvas();
    console.log("in standby mode, click mouse to start system!");
}

function draw(){
    let node = document.querySelector('#testDiv');

    node.innerText = agent.state;
}





function mousePressed() {
    speechSetup();
}


function speechSetup() {
    let speech = new p5.Speech();
    let kickoffSpeech = new p5.Speech();
    let listener = new p5.SpeechRec('en-US', gotSpeech);
    let continuous = false;

    if( selfFeedback ){
        continuous = true;
        console.log("self feedback mode is on");
    }

    let interim = false;
    // listener.start(continuous, interim);
    listener.continuous = continuous;
    listener.interim = interim;

    // start the listener
    function startListener(){
        if( agent.state !== 'listening'){
            listener.start();
        }
    }


    // ***********************CALLBACK FUNCTIONS*****************************

    listener.onStart = function() {
        // console.log("I am listening...");
        agent.state = "listening";
    };
    listener.onEnd = function() {
        // console.log("I stopped listening!!!!!!!");
        if( !selfFeedback ){ agent.state = undefined; }
    };

    // function to execute when speaking starts
    speech.onStart = function() {
        // console.log("started...");
        agent.state = "speaking";
    };

    // function to execute when speaking stops
    speech.onEnd = function() {
        // console.log("stopped talking...");
        if( !selfFeedback ){ agent.state = undefined; }
        // restart listener
        if( !selfFeedback ){ startListener(); console.log("test"); }

    };




    let bot = new RiveScript();

    bot.loadFile("brain.rive").then(brainReady).catch(brainError);

    function brainReady() {
        console.log('Chatbot ready to play!');
        bot.sortReplies();
    }
    function brainError() {
        console.log('Chatbot error!');
    }
    //let button = select('#submit');
    let user_input = select('#user_input');
    let output = select('#output');

    //button.mousePressed(chat);

    let silenceCheckTimer;

    function gotSpeech() {
        if (listener.resultValue) {
            let input = listener.resultString;
            console.log(input);
            //user_input.value(input);
            bot.reply("local-user", input).then(function(reply) {
                listener.rec.abort();
                speech.speak(reply);
                // output.html(reply);
                console.log(reply);
                clearTimeout(silenceCheckTimer);
                silenceCheckTimer = setTimout(function() {
                    listener.rec.abort();
                    agent.state = "speaking";
                    kickoffSpeech.speak(kickoffStatements[2]);
                  },
                  8000
                );

            });
        }
    }


    // timeouts to check agent state
    function checkAgentState() {
        if( typeof agent.state === 'undefined' ){
            console.log("agent is off....");

            // restart you engines!
            startListener();
        }
    }
    let agentCheckTimer = setInterval(checkAgentState, 1000);


    // START THE PROCESS!!!!
    startListener();

    //function chat() {
    //let input = user_input.value();

    //}



    der = listener;
}





let kickoffStatements = [
  "where did you go?",
  "relax I'm still here."

];
