const beginScreenContainer = document.getElementById("begin-page");
const homeScreenContainer = document.getElementById("home-page");
const waitingScreenContainer = document.getElementById("waiting-page");
const gameScreenContainer = document.getElementById("game-screen");
const endScreenContainer = document.getElementById("endScreen");
const startGameButton = document.getElementById('startGameButton');
const finalScreenWithoutLuckydraw = document.getElementById("finalScreen-no-luckydraw");
const finalScreenWithLuckyDraw = document.getElementById("finalScreen-with-luckydraw");
const feedbackContainer = document.getElementById("feedback-container");
const finalScreenWithThanks = document.getElementById("final-screen-thanks")
let currentFinalScreen;

let isSinglePlayerGame;
let thisPlayer;
let otherPlayers = new Map();
let socket;

let baseURL = 'https://quiz-xarm-jumbleword.onrender.com'
//only for testing purpose
baseURL = 'http://localhost:8080';
//hidePage(beginScreenContainer);
//unhidePage(feedbackContainer);

function enterFullscreen() {
  const doc = window.document.documentElement;
  if (doc.requestFullscreen) {
    doc.requestFullscreen();
  } else if (doc.mozRequestFullScreen) {
    doc.mozRequestFullScreen();
  } else if (doc.webkitRequestFullscreen) {
    doc.webkitRequestFullscreen();
  } else if (doc.msRequestFullscreen) {
    doc.msRequestFullscreen();
  }
}

  function beginGameSinglePlayer(){
    isSinglePlayerGame = true;
    thisPlayer = {
      playerName: "",
      isReady: false,
      score: 0,
      gameFinished: false,
    }
    beginButtonClicked();
  }
  function beginGameDoublePlayer(){
    isSinglePlayerGame = false;
    openWebsocketConnection();
  }

function beginButtonClicked() {
    getQuestion();
    getQuestionSequence();
    hidePage(beginScreenContainer);
    unhidePage(homeScreenContainer);
}

function getName() {
    let name = document.getElementById("playerName").value.trim();
    if(name == ""){
      alert("Please enter your name");
      return;
    }else if(!/^[a-zA-Z ]+$/.test(name)){
      alert("Please enter a valid name");
      return;
    }
    thisPlayer.playerName = name;
    
    if(isSinglePlayerGame){
      hidePage(homeScreenContainer);
      unhidePage(gameScreenContainer);
      startQuiz();
      return;
    }

    socket.emit('update-player-details', thisPlayer);
    socket.emit("ready-to-start-game", thisPlayer);
}


function getQuestion() {
    let cachedData = JSON.parse(localStorage?.getItem('questions'));
    if (cachedData) {
        questionsData = cachedData;
    } else {
        // Fetch the data from the server and cache it
        fetch(baseURL + '/questions')
        .then(response => response.json())
        .then(data => {
            questionsData = data;
            localStorage.setItem('questions' , JSON.stringify(data));
        })
        .catch(error => console.error(error));
    }
}

async function getQuestionSequence() {
  try {
    const response = await fetch(baseURL + '/question-sequence'); // Make a request to the server
    const sequence = await response.json(); // Parse the JSON response
    if (Array.isArray(sequence)) {
      questionSequence = sequence; // Store the sequence in the global variable
    } else {
      questionSequence = [2,6,9];
    }
  } catch (error) {
    questionSequence = [1,7,3];
    console.error('Error fetching question sequence:', error);
  }
}

function showEndScreen(){
  thisPlayer.score = timeScore;
  thisPlayer.gameFinished = true;

  if(isSinglePlayerGame){
    hidePage(gameScreenContainer);
    unhidePage(finalScreenWithoutLuckydraw);
    resetVariables();
    return;
  }

  socket.emit("update-player-details", thisPlayer);
  socket.emit("show-leaderboard");
  hidePage(gameScreenContainer);
  unhidePage(endScreenContainer);
  createLeaderboard(); 
}

function startTheGame(){
  hidePage(waitingScreenContainer);
  unhidePage(gameScreenContainer);
  startQuiz(questionsData);
}

function restartQuiz(){
  hidePage(currentFinalScreen);
  unhidePage(beginScreenContainer);
  resetVariables();
}

function resetVariables(){
  fetch(baseURL + '/resetServerVariables')
  .then(response => {
  })
  .catch(error => {
    console.log(error);
  });

  thisPlayer = null;
  otherPlayers.clear();
  isSinglePlayerGame = false;
  document.getElementById("playerName").value = "";
  if(socket){
    socket.disconnect(true);
  }
}

function hidePage(page){
  if(page.classList.contains("hidden")){
    return;
  }
  else{page.classList.add("hidden");}
}

function unhidePage(page){
  if(page.classList.contains("hidden")){
    page.classList.remove("hidden");
  }
}