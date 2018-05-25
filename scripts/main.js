
class User {
    constructor() {
        this.user = {};
        this.firstNameInput = document.getElementById('first-name') ;
        this.lastNameInput = document.getElementById('last-name');
        this.emailInput = document.getElementById('email');
        this.submitButton = document.getElementById('submit-button');
        this.submitButton.addEventListener('click', (e) => this.onSubmit(e));
    }

    createUser() {
        this.user.firstName =  this.firstNameInput.value;
        this.user.lastName = this.lastNameInput.value;
        this.user.email =  this.emailInput.value;
    }

    onSubmit(e) {
        if (this.firstNameInput.checkValidity() && this.lastNameInput.checkValidity() && this.emailInput.checkValidity()) {
            e.preventDefault();
            this.createUser();
            const startPage = document.getElementById('start-page');
            const settingsPage = document.getElementById('settings-page');
            startPage.classList.add('invisible');
            settingsPage.classList.remove('invisible');
        }
    }
}

class Settings {
    constructor(user) {
        this.user = user;
        this.levels = document.getElementById('difficulty');
        this.cardsBacks = document.getElementById('backgrounds');
        this.user.back =  this.cardsBacks.children[0];
        this.user.level = this.levels.children[0];
        this.initSettings();
    }

    initSettings() {
        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', (e) => this.startGame(e));
        this.levels.addEventListener('click', (e) => this.changeSettings(e, 'level', this.levels));
        this.cardsBacks.addEventListener('click', (e) => this.changeSettings(e, 'back', this.cardsBacks));
    }

    changeSettings(e, type, field) {
        if (e.target !== this.user[type] && e.target !== field) {
            e.target.classList.add('selected');
            this.user[type].classList.remove('selected');
            this.user[type] = e.target;
        }
    }

    startGame(e) {
        e.preventDefault();
        const settingsPage = document.getElementById('settings-page');
        const gameContainer = document.getElementById('game-page');
        gameContainer.classList.remove('invisible');
        settingsPage.classList.add('invisible');
    }
}

class Score {
    constructor() {
        this.scoreContainer = document.getElementById('score');
    }

    refreshScore(user) {
        const level = user.level.id;
        if (!localStorage[level]) {
            localStorage[level] = JSON.stringify([user]);
        } else {
            let score = JSON.parse(localStorage[level]);
            score.push(user);
            score.sort((a,b) => a.time - b.time);
            score.length > 10 ? score.pop() : score;
            localStorage[level] = JSON.stringify(score);
        }
        this.showScore(level);
    }

    showScore(level) {
        this.scoreContainer.innerHTML = '';
        const difficulty = document.getElementById('level');
        const scoreList = document.createElement('ol');
        const topScore = JSON.parse(localStorage[level]);
        difficulty.textContent = level;
        topScore.forEach(item => this.createScoreItem (item, scoreList));
        this.scoreContainer.appendChild(scoreList);
    }

    createScoreItem(item, list) {
        const scoreItem = document.createElement('li');
        const itemWrapper = document.createElement('div');
        const name = document.createElement('div');
        const time = document.createElement('div');
        itemWrapper.classList.add('score-item');
        name.textContent = item.firstName;
        time.textContent = item.timeString;
        itemWrapper.appendChild(name);
        itemWrapper.appendChild(time);
        scoreItem.appendChild(itemWrapper);
        list.appendChild(scoreItem);
    }
}

class Game{
    constructor(user, score) {
        this.user = user;
        this.score = score;
        this.startButton = document.getElementById('start-button');
        this.gamePage = document.getElementById('game-page');
        this.congratulations = document.getElementById('congratulations-page');
        this.pauseButton = document.getElementById('pause-button');
        this.exitButton = document.getElementById('main-menu');
        this.pausePage = document.getElementById('pause-page');
        this.restartButton = document.getElementById('play again');
        this.startPage = document.getElementById('start-page');
        this.addEventListeners();
    }

    addEventListeners() {
        this.startButton.addEventListener('click', () => this.initGame());
        this.exitButton.addEventListener('click', () => this.leaveTheGame());
        this.pauseButton.addEventListener('click', () => this.startPause());
        this.pausePage.addEventListener('click', () => this.finishPause());
        this.restartButton.addEventListener('click', () => this.restartGame());
    }
    
    initGame() {
        this.playingCards = [];
        this.openedCards = [];
        this.foundPairs = 0;
        this.renderingTime();
        this.defineNumberOfPairs();
    }

    renderingTime() {
        this.startTime = new Date();
        this.pause = false;
        this.stopTimer = false;
        this.pauseTime = 0;
        this.timerHTML = document.getElementById('timer');
        setInterval(this.createTimer.bind(this), 100);
    }

    createTimer() {
        if (!this.stopTimer) {
            let minutes = Math.floor(this.time / 60);
            let seconds = Math.floor(this.time - 60 * minutes);
            seconds < 10 ? seconds = `0${seconds}`: seconds;
            this.timeString = `${minutes}:${seconds}`;
            this.timerHTML.textContent = this.timeString;
        } else {
            this.timerHTML.textContent = '0:00';
        }
    }

    get time() {
        if (!this.pause) {
            this.currentTime = new Date() - this.pauseTime;
        } else { 
            this.pauseTime = new Date() - this.currentTime;
        }
        let timeInSeconds = Math.floor((this.currentTime - this.startTime) / 1000);
        return timeInSeconds
    }

    startPause() {
        this.pause = true;
        this.pausePage.classList.remove('invisible');
    }

    finishPause() {
        this.pause = false;
        this.pausePage.classList.add('invisible');
    }

    leaveTheGame() {
        this.cardsWrapper.remove();
        this.gamePage.classList.add('invisible');
        this.startPage.classList.remove('invisible');
    }

    createCard(cardFrontSrc) {
        const card = document.createElement('div');
        const flipper = document.createElement('div');
        const backSide = document.createElement('img');
        const frontSide = document.createElement('img');
        card.classList.add('card');
        backSide.classList.add('back');
        frontSide.classList.add('front');
        flipper.classList.add('flipper-container');
        backSide.src = this.user.back.src;
        frontSide.src = cardFrontSrc;
        flipper.appendChild(backSide);
        flipper.appendChild(frontSide);
        card.appendChild(flipper);
        return card;
    }

    defineNumberOfPairs() {
        this.difficulty = this.user.level.id;
        switch (this.difficulty) {
            case 'easy':  
                this.fillingArrayOfCards(6);
                break;
            case 'medium': 
                this.fillingArrayOfCards(9);
                break;
            case 'hard': 
                this.fillingArrayOfCards(12);
                break;
        }
    }

    fillingArrayOfCards(length) {
        const back = this.user.back.id;
        let arrayOfPath = [];
        for(let i = 0; i < length; i++) {
            arrayOfPath[i] = `img/fronts/${back}/${i}.png`;
            arrayOfPath[i + length] = arrayOfPath[i];
        }
        this.shuffleArray(arrayOfPath);
        this.createPlayingField(arrayOfPath)
    }

    shuffleArray(array) {
        array.sort((a,b) => Math.random() - 0.5);
    }    

    createPlayingField(sources) {
        this.cardsWrapper = document.createElement('section');
        this.cardsWrapper.classList.add(`${this.difficulty}-field`);
        sources.forEach(item => {
            const gameCard = this.createCard(item);
            this.cardsWrapper.appendChild(gameCard);
            this.playingCards.push(gameCard);
            gameCard.addEventListener('click', (e) => this.clickOnCard(e));
        });
        this.gamePage.appendChild(this.cardsWrapper);
    }

    clickOnCard(e) {
        let back = e.target;
        let front = e.target.nextSibling;
        if (!back.classList.contains('hidden') && back.nodeName === 'IMG') {
            if (this.openedCards.length === 0 && front) {
                this.openedCards.push(front);
                back.parentNode.classList.add('rotate');
            } 
            else if (this.openedCards.length === 1 && !back.parentNode.classList.contains('rotate')) {
                this.openedCards.push(front);
                back.parentNode.classList.add('rotate');
                setTimeout(this.isEqual.bind(this), 1000)
            }
        }
    }

    isEqual() {
        const allPairs = this.playingCards.length / 2;
        if (this.openedCards[0].src === this.openedCards[1].src) {
            this.openedCards[0].classList.add('hidden');
            this.openedCards[1].classList.add('hidden');
            this.foundPairs++;
            this.foundPairs === allPairs ? setTimeout(this.completeGame.bind(this), 1000) : this.openedCards = [];
        } else {
            this.openedCards[0].parentNode.classList.remove('rotate');
            this.openedCards[1].parentNode.classList.remove('rotate');
            this.openedCards = [];
        }
    }

    completeGame() {
        this.stopTimer = true;
        this.user.time = this.time;
        this.user.timeString = this.timeString;
        this.gamePage.classList.add('invisible');
        this.congratulations.classList.remove('invisible');
        const finishTime = document.getElementById('result');
        finishTime.textContent = this.user.timeString;
        this.score.refreshScore(this.user);
    }

    restartGame() {
        this.startPage.classList.remove('invisible');
        this.cardsWrapper.remove();
        this.congratulations.classList.add('invisible');
    }
}

const user = new User();
const settings = new Settings(user.user);
const score = new Score();
const game = new Game(user.user, score);
