const QUESTION_TIME = 9;
let questions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;

// Элементы DOM
const splashScreen = document.getElementById('splashScreen');
const mainScreen = document.getElementById('mainScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');
const finalScreen = document.getElementById('finalScreen');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const questionText = document.getElementById('questionText');
const answersDiv = document.getElementById('answers');
const scoreLabel = document.getElementById('scoreLabel');
const timerEl = document.getElementById('timer');
const progressFill = document.getElementById('progressFill');
const finalText = document.getElementById('finalText');
const bonusText = document.getElementById('bonusText');
const difficultyLabel = document.getElementById('difficultyLabel');
const questionsCountEl = document.getElementById('questionsCount');
const overlay = document.getElementById('overlay');
const rulesModal = document.getElementById('rulesModal');
const boomEffect = document.getElementById('finalBoom');

// ---------- Генерация случайного ID ----------
function generatePlayerId() {
    return `Игрок#${Math.floor(1000 + Math.random() * 9000)}`;
}

// ---------- Инициализация профиля ----------
function initPlayerProfile() {
    window.playerData = { id: generatePlayerId(), level: 1, games: 0, highScore: 0 };
    refreshPlayerProfile();
}

function refreshPlayerProfile() {
    document.getElementById('playerId').textContent = window.playerData.id;
    document.getElementById('playerLevel').textContent = window.playerData.level;
    document.getElementById('playerGames').textContent = window.playerData.games;
    document.getElementById('playerHighScore').textContent = window.playerData.highScore;
}

function updatePlayerStats(score) {
    window.playerData.games += 1;
    if(score > window.playerData.highScore) window.playerData.highScore = score;
}

// ---------- Экран ----------
function show(el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    el.classList.remove('hidden');
}

function showSplash() {
    splashScreen.style.display = 'flex';
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display='none'; show(mainScreen); }, 500);
    }, 1500);
}

// ---------- События кнопок ----------
document.getElementById('toLobbyBtn').addEventListener('click', () => { show(lobbyScreen); refreshPlayerProfile(); });
document.getElementById('backBtn').addEventListener('click', () => { show(mainScreen); refreshPlayerProfile(); });
document.getElementById('rulesBtn').addEventListener('click', () => { overlay.style.display='block'; rulesModal.style.display='block'; });
document.getElementById('closeRulesBtn').addEventListener('click', () => { overlay.style.display='none'; rulesModal.style.display='none'; });
document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('replayBtn').addEventListener('click', () => { show(gameScreen); startGame(); });
document.getElementById('toLobbyBtn2').addEventListener('click', () => { show(lobbyScreen); refreshPlayerProfile(); });

// ---------- Перемешивание ----------
function shuffleArray(arr) { return arr.slice().sort(()=> Math.random() - 0.5); }

// ---------- Функция для красивого текста уровня ----------
function getLevelLabel(level){
    switch(level){
        case 'easy': return '🟢 Легкий';
        case 'medium': return '🟡 Средний';
        case 'hard': return '🟠 Сложный';
        case 'ultra': return '🔴 Ультра';
        default: return '';
    }
}

// ---------- Загрузка вопросов с уровнями ----------
function loadQuestions() {
    const easy = shuffleArray(window.allQuestions.filter(q=>q.level==='easy')).slice(0,3);
    const medium = shuffleArray(window.allQuestions.filter(q=>q.level==='medium')).slice(0,3);
    const hard = shuffleArray(window.allQuestions.filter(q=>q.level==='hard')).slice(0,3);
    const ultra = shuffleArray(window.allQuestions.filter(q=>q.level==='ultra')).slice(0,1);

    questions = [...easy, ...medium, ...hard, ...ultra];

    qTotalEl.textContent = questions.length;
    questionsCountEl.textContent = window.allQuestions.length;
}

// ---------- Старт игры ----------
function startGame() {
    loadQuestions();
    currentIndex = 0;
    score = 0;
    scoreLabel.textContent = '0';
    show(gameScreen);
    showQuestion();
}

// ---------- Показ вопроса ----------
function showQuestion() {
    clearInterval(timerInterval);
    const q = questions[currentIndex];
    qIndexEl.textContent = currentIndex + 1;
    questionText.textContent = q.text;
    answersDiv.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => selectAnswer(idx));
        answersDiv.appendChild(btn);
    });

    difficultyLabel.textContent = getLevelLabel(q.level);
    difficultyLabel.className = `difficulty ${q.level}`;

    let t = QUESTION_TIME;
    timerEl.textContent = `${t}s`;
    progressFill.style.width = '100%';
    timerInterval = setInterval(() => {
        t--;
        timerEl.textContent = `${t}s`;
        progressFill.style.width = `${(t/QUESTION_TIME)*100}%`;
        if(t <= 0){ clearInterval(timerInterval); endGame(false); }
    },1000);
}

// ---------- Выбор ответа ----------
function selectAnswer(selectedIdx) {
    clearInterval(timerInterval);
    const q = questions[currentIndex];
    const buttons = Array.from(answersDiv.children);

    if(selectedIdx === q.correct) {
        score += 10;
        scoreLabel.textContent = score;

        // Анимация +10 очков
        const plus = document.getElementById('scorePlus');
        plus.classList.remove('show');
        void plus.offsetWidth;
        plus.classList.add('show');

        buttons[selectedIdx].classList.add('correct');
        setTimeout(() => nextQuestion(), 600);
    } else {
        buttons[selectedIdx].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
        setTimeout(() => endGame(false), 1000);
    }
}

// ---------- Следующий вопрос ----------
function nextQuestion() {
    currentIndex++;
    if(currentIndex >= questions.length){ endGame(true); return; }
    showQuestion();
}

// ---------- Конец игры ----------
function endGame(completed) {
    clearInterval(timerInterval);

    // Бонус за 100% правильных
    if(completed && score === questions.length*10){
        score += 50;
        bonusText.style.display = 'inline-block';
        bonusText.textContent = '+50 БОНУСНЫХ ОЧКОВ!';
        bonusText.classList.remove('bonus-animate');
        void bonusText.offsetWidth;
        bonusText.classList.add('bonus-animate');

        // Эффект «Бум!»
        boomEffect.classList.remove('show');
        void boomEffect.offsetWidth;
        boomEffect.classList.add('show');
    } else bonusText.style.display='none';

    updatePlayerStats(score);
    refreshPlayerProfile();
    finalText.textContent = `ИГРА ОКОНЧЕНА! ВАШИ ОЧКИ: ${score}`;
    show(finalScreen);
}

// ---------- Старт ----------
showSplash();
initPlayerProfile();
