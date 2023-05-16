let questionsData;
let currentQuestion;

let correctAnswerLength;
//stores the user's answer
let userInput = [];
//stores the blank boxes where user can input the answer; contains an object with user value buttopn html id and the input ka html id
let inputBoxes = [];
let inputPointer = 0;
let submitButtonHTML = document.getElementById("submitButtonQuiz");

let questionStatement;
let options;
let correctAnswer;

const timeAllowed = 0;
let currentTime = 0;
let timeScore = 0;
let shouldTimerRun =true;
const timerHTML = document.getElementById("timer");
let timerIntervalID;

let questionSequence = [5,3,8];

let wrongAnswerAudio = document.getElementById("wrongAnswerAudio");
let quizCompletedAudio = document.getElementById("quizCompletedAudio");
let optionClickAudio = document.getElementById("optionClickAudio");
let correctAnswerAudio = document.getElementById("correctAnswerAudio");

function startQuiz(){
    timeScore = 0;
    getNextQuestion();
}

function getNextQuestion(){
    if(questionSequence.length > 0){
        currentQuestion = questionsData[questionSequence.pop()]; 
        displayQuestion(currentQuestion);
        startTimer();
    }
    else{
        quizEnded();
    }
}

function quizEnded(){
    clearInterval(timerIntervalID);
    playSound(quizCompletedAudio);
    shouldTimerRun = false;
}

function startTimer(){
    clearInterval(timerIntervalID);
    shouldTimerRun = true;
    currentTime = 0;
    timerHTML.innerText = currentTime;
    timerIntervalID = window.setInterval(updateTime, 1000);
}

function updateTime(){
    if(shouldTimerRun){
        currentTime++;
        timerHTML.innerText = currentTime;
        // HAVE A LOOK AT THIS
        // if(currentTime <= 0){
        //     shouldTimerRun = false;
        //     displayFeedback(false, currentQuestion);
        // }
    }
}

// function displayFeedback(isAnsweredCorrectly, question){
//     shouldTimerRun = false;
//     clearInterval(timerIntervalID);
//     timeScore += timeAllowed - currentTime;

//     const answerArea = document.getElementById("answer-area");
    
//     if(isAnsweredCorrectly){
//         answerArea.childNodes.forEach(c =>{
//             c.classList.add("correct-answer");
//         });
//     }else{
//         answerArea.childNodes.forEach(c =>{
//             c.classList.add("wrong-answer");
//         });
//     }

//     window.setTimeout(()=>{getNextQuestion();},1000)
// }

function displayQuestion(question){
    questionStatement = question.questionStatement;
    options = question.options;
    correctAnswer = question.correctAnswer;

    const questionHTML = document.getElementById("question-statement");
    const optionBox = document.getElementById("option-box");
    const answerArea = document.getElementById("answer-area");

    correctAnswerLength = correctAnswer.length;
    userInput.length = 0;
    inputBoxes.length = 0;
    inputPointer = 0;

    //display questions
    questionHTML.innerText = questionStatement;

    //display the answer area
    while(answerArea.hasChildNodes()){
        answerArea.removeChild(answerArea.firstChild);
    }

    for(i = 0; i < correctAnswerLength; i++){
        const newInputBox = document.createElement('div');
        newInputBox.classList.add('input-box');
        answerArea.appendChild(newInputBox);
        const tempBox = {
            optionButton: null,
            inputBox: newInputBox
        }
        inputBoxes.push(tempBox);
    }

    //highlight the input boxes
    inputBoxes[0].inputBox.classList.toggle("highlight");

    //display the options
    while(optionBox.hasChildNodes()){
        optionBox.removeChild(optionBox.firstChild);
    }

    for(i = 0; i < options.length; i++){
        const newOptionButton = document.createElement('button');
        newOptionButton.classList.add('option');
        newOptionButton.innerText = options[i];
        newOptionButton.value = options[i];
        newOptionButton.onclick = optionPressed;
        optionBox.appendChild(newOptionButton);
    }
    const newRemoveButton = document.createElement('div');
    newRemoveButton.classList.add('remove-option');
    newRemoveButton.onclick = removeOption;
    answerArea.appendChild(newRemoveButton);

    //highlight the first option button
    submitButtonHTML.disabled = true;

}

function optionPressed(){

    playSound(optionClickAudio);
    
    if(inputPointer > inputBoxes.length - 1){
        //may be we can give visual feedback to the user that something is wrong
        return;
    }
    if(inputPointer == inputBoxes.length-1){
        submitButtonHTML.disabled = false;
    }

    userInput.push(this.value);
    inputBoxes[inputPointer].optionButton = this;
    inputBoxes[inputPointer].inputBox.innerText = inputBoxes[inputPointer].optionButton.value;
    toggleHighlight(inputPointer);
    inputPointer++;
    toggleHighlight(inputPointer);
    this.disabled = true;
}

function removeOption(){
    
    if(inputPointer <= inputBoxes.length){
        submitButtonHTML.disabled = true;
    }
    if(inputPointer > 0){
        toggleHighlight(inputPointer);
    }
    inputPointer--;
    if(inputPointer < 0){
        inputPointer = 0;
        return;
    }
    userInput.pop();
    inputBoxes[inputPointer].optionButton.disabled = false;
    inputBoxes[inputPointer].inputBox.innerText = "";
    toggleHighlight(inputPointer);
}

function toggleHighlight(inputPointer){
    if(inputBoxes[inputPointer]){
        inputBoxes[inputPointer].inputBox.classList.toggle("highlight");
    }
}

function validateAnswer(){
    if(userInput.join('') == correctAnswer){
        //play some confetti animation, wait for 1 second and then move to the next question
        correctAnswerAudio.play();
        shouldTimerRun = false;

        if(!isNewUser){
            currentFinalScreen = finalScreenWithThanks;
        }
        else if(currentTime < 60){
            currentFinalScreen = finalScreenWithLuckyDraw;
        }
        else{
            currentFinalScreen = finalScreenWithoutLuckydraw;
        }

        hidePage(gameScreenContainer);
        unhidePage(currentFinalScreen);
    }
    else{
        //play some wrong answer animation
        playSound(wrongAnswerAudio);
        const answerArea = document.getElementById("answer-area");
        answerArea.childNodes.forEach(c =>{
        c.classList.add("wrong-answer");
        window.setTimeout(()=>{c.classList.toggle("wrong-answer"); displayQuestion(currentQuestion);
        shouldTimerRun = false;
        hidePage(gameScreenContainer);
        displayFeedback();
    },300)
        });
    }
}

function playSound(audio) {  
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
      audio.play();
    }
}


//feedback box separated
const feedbackText = document.getElementById("feedback-box-text");
const okButton = document.getElementById("ok-button");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");

//displayFeedback();
function displayFeedback(){
    shouldTimerRun = false;
    unhidePage(feedbackContainer);
    unhidePage(feedbackText);
    feedbackText.innerText = "Your answer is incorrect. Do you want to play again?";
    hidePage(okButton);
    unhidePage(yesButton);
    unhidePage(noButton);
}

function yesButtonPressed(){
    shouldTimerRun = true;
    hidePage(feedbackContainer);
    unhidePage(gameScreenContainer);
}

function noButtonPressed(){
    feedbackText.innerText = "The correct answer is " + currentQuestion.correctAnswer;
    hidePage(yesButton);
    hidePage(noButton);
    unhidePage(okButton);
}

function okButtonPressed(){
    currentFinalScreen = finalScreenWithThanks;
    quizEnded();
    hidePage(feedbackContainer);
    unhidePage(currentFinalScreen);
}

//testing only
// displayQuestion({
//     "questionStatement":"The practice of collecting, processing, and analyzing telemetry data from distributed systems to gain insights into their behavior, performance, and health",
//     "options":["V","I","R","L","E","I","O","Y","T","S","B","B","A"],
//     "correctAnswer":"OBSERVABILITY"
// });