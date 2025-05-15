// Firebaseの設定（先ほど取得したconfigを貼り付けてください）
const firebaseConfig = {
  apiKey: "AIzaSyC-151SXpJ_7_aQHGjiUufY5YEjhDPYrV0",
  authDomain: "kobakita-land.firebaseapp.com",
  projectId: "kobakita-land",
  storageBucket: "kobakita-land.firebasestorage.app",
  messagingSenderId: "8764797288",
  appId: "1:8764797288:web:f799c4c84a5bea60a766dd"
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentQuestion = 0;
let correctAnswers = 0;
let startTime;
let timerInterval;

const questions = [];
for (let i = 0; i < 10; i++) {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  questions.push({ num1, num2 });
}

function startGame() {
  currentQuestion = 0;
  correctAnswers = 0;
  startTime = Date.now();
  showQuestion();
}

function showQuestion() {
  if (currentQuestion < questions.length) {
    const { num1, num2 } = questions[currentQuestion];
    const correctAnswer = num1 * num2;
    const choices = [correctAnswer];
    while (choices.length < 3) {
      const randomChoice = Math.floor(Math.random() * 81) + 1;
      if (!choices.includes(randomChoice)) {
        choices.push(randomChoice);
      }
    }
    choices.sort(() => Math.random() - 0.5);

    document.getElementById('question').textContent = `${num1} × ${num2} = ?`;
    const buttons = document.getElementById('buttons');
    buttons.innerHTML = '';
    choices.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice;
      button.onclick = () => checkAnswer(choice, correctAnswer);
      buttons.appendChild(button);
    });
  } else {
    endGame();
  }
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    correctAnswers++;
  }
  currentQuestion++;
  showQuestion();
}

function endGame() {
  const elapsedTime = (Date.now() - startTime) / 1000;
  document.getElementById('result').textContent = `正解数: ${correctAnswers} / 10`;
  document.getElementById('timer').textContent = `かかった時間: ${elapsedTime.toFixed(2)}秒`;
  saveScore(elapsedTime);
}

function saveScore(time) {
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    db.collection('scores').add({
      userId,
      time,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      console.log('スコアが保存されました');
      showLeaderboard();
    }).catch(error => {
      console.error('スコアの保存に失敗しました:', error);
    });
  }
}

function showLeaderboard() {
  db.collection('scores')
    .orderBy('time')
    .limit(5)
    .get()
    .then(snapshot => {
      const leaderboard = document.createElement('div');
      leaderboard.innerHTML = '<h2>ランキング</h2>';
      snapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        const time = data.time;
        leaderboard.innerHTML += `<p>ユーザーID: ${userId} - ${time.toFixed(2)}秒</p>`;
      });
      document.body.appendChild(leaderboard);
    })
    .catch(error => {
      console.error('ランキングの取得に失敗しました:', error);
    });
}

auth.onAuthStateChanged(user => {
  if (user) {
    startGame();
  } else {
    console.log('ログインしてください');
  }
});
