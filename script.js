const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector("#reset-btn");
const newGameBtn = document.querySelector("#new-btn");
const playAgainBtn = document.querySelector("#play-again-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");

const friendModeBtn = document.querySelector("#friend-mode");
const botModeBtn = document.querySelector("#bot-mode");
const modeSelection = document.querySelector("#mode-selection");

const symbolSelection = document.querySelector("#symbol-selection");
const chooseO = document.querySelector("#choose-o");
const chooseX = document.querySelector("#choose-x");

const container = document.querySelector(".container");

const youScoreEl = document.querySelector("#you-score");
const botScoreEl = document.querySelector("#bot-score");
const drawScoreEl = document.querySelector("#draw-score");

// Customize section
const customizeBtn = document.querySelector("#customize-btn");
const customizeScreen = document.querySelector("#customize-screen");
const saveCustomizeBtn = document.querySelector("#save-customize");
const backToModeBtn = document.querySelector("#back-to-mode");

const playerNameInput = document.querySelector("#player-name");
const themeSelect = document.querySelector("#theme-select");
const difficultySelect = document.querySelector("#difficulty-select");

let isBotMode = false;
let yourSymbol = "O";
let botSymbol = "X";
let currentTurnSymbol = "X";
let count = 0;
let youScore = 0,
  botScore = 0,
  drawScore = 0;
let playerName = "You";
let botDifficulty = "smart";

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// ---------- MODE SELECTION ----------
friendModeBtn.onclick = () => startSymbolSelection(false);
botModeBtn.onclick = () => startSymbolSelection(true);
customizeBtn.onclick = () => {
  modeSelection.classList.add("hide");
  customizeScreen.classList.remove("hide");
};

// ---------- CUSTOMIZE ----------
saveCustomizeBtn.onclick = () => {
  playerName = playerNameInput.value.trim() || "You";
  botDifficulty = difficultySelect.value;
  document.body.className = themeSelect.value; // change theme
  customizeScreen.classList.add("hide");
  modeSelection.classList.remove("hide");
};

backToModeBtn.onclick = () => {
  customizeScreen.classList.add("hide");
  modeSelection.classList.remove("hide");
};

// ---------- SYMBOL SELECTION ----------
function startSymbolSelection(isBot) {
  isBotMode = isBot;
  modeSelection.classList.add("hide");
  symbolSelection.classList.remove("hide");
}

chooseO.onclick = () => startGame("O");
chooseX.onclick = () => startGame("X");

function startGame(symbol) {
  yourSymbol = symbol;
  botSymbol = symbol === "O" ? "X" : "O";
  currentTurnSymbol = "X";
  symbolSelection.classList.add("hide");
  container.classList.remove("hide");
  resetBtn.classList.remove("hide");
  resetGame(false);

  if (isBotMode && currentTurnSymbol === botSymbol) setTimeout(botMove, 400);
}

// ---------- GAMEPLAY ----------
boxes.forEach((box) => (box.onclick = () => handleMove(box)));

function handleMove(box) {
  if (box.innerText !== "") return;
  if (isBotMode && currentTurnSymbol !== yourSymbol) return;

  box.innerText = currentTurnSymbol;
  box.disabled = true;
  count++;

  if (checkWinner()) return;
  if (count === 9) return gameDraw();

  currentTurnSymbol = currentTurnSymbol === "X" ? "O" : "X";
  if (isBotMode && currentTurnSymbol === botSymbol) setTimeout(botMove, 400);
}

// ---------- BOT ----------
function botMove() {
  const emptyBoxes = [...boxes].filter((b) => b.innerText === "");
  if (!emptyBoxes.length) return;

  let move;
  if (botDifficulty === "easy") {
    move = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
  } else if (botDifficulty === "smart") {
    move = findBestMove(botSymbol) || findBestMove(yourSymbol) || emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
  } else {
    move = findBestMove(botSymbol) || findBestMove(yourSymbol) || (boxes[4].innerText === "" ? boxes[4] : emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)]);
  }

  move.innerText = botSymbol;
  move.disabled = true;
  count++;

  if (checkWinner()) return;
  if (count === 9) return gameDraw();
  currentTurnSymbol = yourSymbol;
}

function findBestMove(symbol) {
  for (const [a, b, c] of winPatterns) {
    const vals = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    if (vals.filter(v => v === symbol).length === 2 && vals.includes("")) {
      return boxes[[a, b, c][vals.indexOf("")]];
    }
  }
  return null;
}

// ---------- GAME STATUS ----------
function checkWinner() {
  for (const [a, b, c] of winPatterns) {
    const vals = [boxes[a], boxes[b], boxes[c]].map(b => b.innerText);
    if (vals[0] && vals[0] === vals[1] && vals[1] === vals[2]) {
      highlightWinner([a, b, c]);
      showWinner(vals[0]);
      return true;
    }
  }
  return false;
}

function highlightWinner(pattern) {
  pattern.forEach((i) => (boxes[i].style.backgroundColor = "#90EE90"));
}

function showWinner(winner) {
  msg.innerText = isBotMode
    ? winner === yourSymbol
      ? `🎉 Congratulations ${playerName}! You Win!`
      : "🤖 Bot Wins!"
    : `🎉 Congratulations! ${winner} Wins!`;

  if (isBotMode) {
    if (winner === yourSymbol) youScore++;
    else if (winner === botSymbol) botScore++;
  }
  updateScoreboard();
  msgContainer.classList.remove("hide");
  disableBoxes();
}

function gameDraw() {
  msg.innerText = "It's a Draw!";
  drawScore++;
  updateScoreboard();
  msgContainer.classList.remove("hide");
  disableBoxes();
}

function disableBoxes() {
  boxes.forEach((b) => (b.disabled = true));
}

function enableBoxes() {
  boxes.forEach((b) => {
    b.disabled = false;
    b.innerText = "";
    b.style.backgroundColor = "#ffffc7";
  });
  count = 0;
}

function updateScoreboard() {
  youScoreEl.innerText = `${playerName}: ${youScore}`;
  botScoreEl.innerText = `Bot: ${botScore}`;
  drawScoreEl.innerText = `Draws: ${drawScore}`;
}

// ---------- RESET ----------
resetBtn.onclick = () => {
  const hasMoves = [...boxes].some(b => b.innerText !== "");
  if (!hasMoves || confirm("Reset the current game? Scores will remain.")) resetGame(false);
};

newGameBtn.onclick = () => {
  if (confirm("Start a new game? This resets scores too.")) {
    youScore = botScore = drawScore = 0;
    updateScoreboard();
    resetGame(false);
  }
};

playAgainBtn.onclick = () => resetGame(false);

function resetGame() {
  enableBoxes();
  msgContainer.classList.add("hide");
  currentTurnSymbol = "X";
  count = 0;
  if (isBotMode && currentTurnSymbol === botSymbol) setTimeout(botMove, 400);
}
