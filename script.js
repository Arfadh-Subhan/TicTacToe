// Tic Tac Toe - Complete Game Logic

// Game State
let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameActive: true,
    xScore: 0,
    oScore: 0,
    currentMatch: 1,
    bestOf: 3,
    matchWinner: null,
    playerXName: 'Player X',
    playerOName: 'Player O',
    starterPlayer: 'X',
    winnerLine: null
};

let currentEditingPlayer = null;
let toastTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGame();
    loadSavedData();
    showSetupModal();
    initShareButtons();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = { game: document.getElementById('gamePage'), support: document.getElementById('supportPage') };
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    window.switchPage = (pageId) => {
        Object.values(pages).forEach(p => p?.classList.remove('active'));
        if (pages[pageId]) pages[pageId].classList.add('active');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) link.classList.add('active');
        });
        navMenu?.classList.remove('active');
    };

    navLinks.forEach(link => link.addEventListener('click', () => switchPage(link.getAttribute('data-page'))));
    if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
}

function initShareButtons() {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent('Play Tic Tac Toe - Classic strategy game! ✘◯');
    
    document.getElementById('shareTwitter')?.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank'));
    document.getElementById('shareWhatsapp')?.addEventListener('click', () => window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, '_blank'));
    document.getElementById('shareTelegram')?.addEventListener('click', () => window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank'));
}

function loadSavedData() {
    const savedX = localStorage.getItem('ttt_playerX');
    const savedO = localStorage.getItem('ttt_playerO');
    if (savedX) gameState.playerXName = savedX;
    if (savedO) gameState.playerOName = savedO;
    updateDisplayNames();
}

function savePlayerNames() {
    localStorage.setItem('ttt_playerX', gameState.playerXName);
    localStorage.setItem('ttt_playerO', gameState.playerOName);
}

function updateDisplayNames() {
    document.getElementById('playerXName').innerText = gameState.playerXName;
    document.getElementById('playerOName').innerText = gameState.playerOName;
    document.getElementById('displayNameX').innerText = gameState.playerXName;
    document.getElementById('displayNameO').innerText = gameState.playerOName;
    updateTurnText();
}

function updateTurnText() {
    const turnText = document.getElementById('turnText');
    const currentPlayerName = gameState.currentPlayer === 'X' ? gameState.playerXName : gameState.playerOName;
    const symbol = gameState.currentPlayer === 'X' ? '✘' : '◯';
    turnText.innerHTML = `${currentPlayerName}'s Turn ${symbol}`;
}

function updateScoresUI() {
    document.getElementById('scoreX').innerText = gameState.xScore;
    document.getElementById('scoreO').innerText = gameState.oScore;
    const matchText = gameState.bestOf === 0 ? `Match ${gameState.currentMatch}` : `Match ${gameState.currentMatch} / ${gameState.bestOf}`;
    document.getElementById('matchCounter').innerHTML = matchText;
    document.getElementById('bestOfBadge').innerHTML = gameState.bestOf === 0 ? '∞ Unlimited' : `🏆 Best of ${gameState.bestOf}`;
}

function initGame() {
    createBoard();
    setupEventListeners();
}

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
}

function handleCellClick(index) {
    if (!gameState.gameActive || gameState.board[index] !== null) return;
    if (gameState.matchWinner) return;
    placeMark(index);
}

function placeMark(index) {
    gameState.board[index] = gameState.currentPlayer;
    updateBoardUI();
    
    const winner = checkWinner();
    if (winner) {
        handleRoundEnd(winner);
        return;
    }
    
    const isDraw = gameState.board.every(cell => cell !== null);
    if (isDraw) {
        handleDraw();
        return;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnText();
}

function updateBoardUI() {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < cells.length; i++) {
        const mark = gameState.board[i];
        if (mark && !cells[i].hasChildNodes()) {
            const svg = mark === 'X' ? createXSVG() : createOSVG();
            cells[i].appendChild(svg);
        }
    }
}

function createXSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '20'); line1.setAttribute('y1', '20');
    line1.setAttribute('x2', '80'); line1.setAttribute('y2', '80');
    line1.classList.add('x-line1');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '80'); line2.setAttribute('y1', '20');
    line2.setAttribute('x2', '20'); line2.setAttribute('y2', '80');
    line2.classList.add('x-line2');
    svg.appendChild(line1); svg.appendChild(line2);
    return svg;
}

function createOSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50'); circle.setAttribute('cy', '50');
    circle.setAttribute('r', '35');
    svg.appendChild(circle);
    return svg;
}

function checkWinner() {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
            gameState.winnerLine = pattern;
            highlightWinningCells(pattern);
            return gameState.board[a];
        }
    }
    return null;
}

function highlightWinningCells(pattern) {
    const cells = document.querySelectorAll('.cell');
    pattern.forEach(idx => cells[idx].classList.add('win-highlight'));
}

function handleRoundEnd(winner) {
    gameState.gameActive = false;
    if (winner === 'X') gameState.xScore++;
    else gameState.oScore++;
    updateScoresUI();
    
    const targetWins = gameState.bestOf === 0 ? Infinity : Math.ceil(gameState.bestOf / 2);
    const matchWinner = gameState.xScore >= targetWins ? 'X' : (gameState.oScore >= targetWins ? 'O' : null);
    
    if (matchWinner) {
        gameState.matchWinner = matchWinner;
        showMatchWinner(matchWinner);
    } else {
        setTimeout(() => resetBoardForNextRound(), 1500);
    }
}

function handleDraw() {
    gameState.gameActive = false;
    showToast("It's a Draw! 🤝");
    setTimeout(() => resetBoardForNextRound(), 1500);
}

function resetBoardForNextRound() {
    gameState.board = Array(9).fill(null);
    gameState.gameActive = true;
    gameState.currentPlayer = gameState.starterPlayer === 'random' ? (Math.random() < 0.5 ? 'X' : 'O') : gameState.starterPlayer;
    gameState.winnerLine = null;
    gameState.currentMatch++;
    updateScoresUI();
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => { cell.innerHTML = ''; cell.classList.remove('win-highlight'); });
    updateTurnText();
}

function showMatchWinner(winner) {
    const winnerName = winner === 'X' ? gameState.playerXName : gameState.playerOName;
    const finalScore = `${gameState.playerXName}: ${gameState.xScore}  |  ${gameState.playerOName}: ${gameState.oScore}`;
    document.getElementById('winnerTitle').innerHTML = `🏆 ${winnerName} WINS! 🏆`;
    document.getElementById('winnerMessage').innerHTML = `${winnerName} wins the match!`;
    document.getElementById('finalScore').innerHTML = finalScore;
    const winnerHeader = document.getElementById('winnerHeader');
    winnerHeader.style.background = winner === 'X' ? 'linear-gradient(135deg, #006400 0%, #00AA00 100%)' : 'linear-gradient(135deg, #4a0000 0%, #8B0000 100%)';
    document.getElementById('winnerModal').classList.add('active');
}

function resetFullMatch() {
    gameState.board = Array(9).fill(null);
    gameState.gameActive = true;
    gameState.xScore = 0;
    gameState.oScore = 0;
    gameState.currentMatch = 1;
    gameState.matchWinner = null;
    gameState.winnerLine = null;
    gameState.currentPlayer = gameState.starterPlayer === 'random' ? (Math.random() < 0.5 ? 'X' : 'O') : gameState.starterPlayer;
    updateScoresUI();
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => { cell.innerHTML = ''; cell.classList.remove('win-highlight'); });
    updateTurnText();
    document.getElementById('winnerModal').classList.remove('active');
}

function resetBoard() {
    gameState.board = Array(9).fill(null);
    gameState.gameActive = true;
    gameState.winnerLine = null;
    gameState.currentPlayer = gameState.starterPlayer === 'random' ? (Math.random() < 0.5 ? 'X' : 'O') : gameState.starterPlayer;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => { cell.innerHTML = ''; cell.classList.remove('win-highlight'); });
    updateTurnText();
    showToast("Board reset!");
}

function showSetupModal() {
    // Reset best of buttons to current value
    document.querySelectorAll('.best-of-btn').forEach(btn => {
        if (parseInt(btn.dataset.best) === gameState.bestOf) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reset starter buttons to current value
    document.querySelectorAll('.starter-btn').forEach(btn => {
        if (btn.dataset.starter === gameState.starterPlayer) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const modal = document.getElementById('setupModal');
    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) {
        modalCard.scrollTop = 0;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSetupModal() { 
    document.getElementById('setupModal').classList.remove('active');
    document.body.style.overflow = '';
}

function showNameEditor(player) {
    currentEditingPlayer = player;
    const label = document.getElementById('nameEditorLabel');
    const input = document.getElementById('nameEditorInput');
    if (player === 'X') {
        label.innerHTML = 'Player X Name';
        input.value = gameState.playerXName;
    } else {
        label.innerHTML = 'Player O Name';
        input.value = gameState.playerOName;
    }
    document.getElementById('nameEditorModal').classList.add('active');
}

function closeNameEditor() { 
    document.getElementById('nameEditorModal').classList.remove('active'); 
}

function saveName() {
    const input = document.getElementById('nameEditorInput');
    const newName = input.value.trim();
    if (!newName) return;
    if (currentEditingPlayer === 'X') {
        gameState.playerXName = newName;
    } else {
        gameState.playerOName = newName;
    }
    savePlayerNames();
    updateDisplayNames();
    closeNameEditor();
}

function setupEventListeners() {
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => resetBoard());
    
    // New match button
    document.getElementById('newMatchBtn').addEventListener('click', () => { 
        if (confirm('Start a new match? Current progress will be lost.')) {
            resetFullMatch();
        } 
    });
    
    // HOME MENU BUTTON - opens setup modal
    document.getElementById('homeMenuBtn')?.addEventListener('click', () => {
        showSetupModal();
    });
    
    // Best of buttons
    document.querySelectorAll('.best-of-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.best-of-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.bestOf = parseInt(btn.dataset.best);
            updateScoresUI();
        });
    });
    
    // Starter buttons
    document.querySelectorAll('.starter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.starter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.starterPlayer = btn.dataset.starter;
        });
    });
    
    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', () => { 
        resetFullMatch(); 
        closeSetupModal(); 
    });
    
    // Player name wrappers
    document.querySelectorAll('.player-name-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const player = wrapper.dataset.player;
            showNameEditor(player);
        });
    });
    
    // Name editor buttons
    document.getElementById('saveNameBtn').addEventListener('click', saveName);
    document.getElementById('cancelNameBtn').addEventListener('click', closeNameEditor);
    document.getElementById('closeNameEditorBtn').addEventListener('click', closeNameEditor);
    
    // Play again button
    document.getElementById('playAgainMatchBtn').addEventListener('click', () => { 
        resetFullMatch(); 
        document.getElementById('winnerModal').classList.remove('active'); 
    });
    
    // Social links
    document.getElementById('instaLink')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        window.open('https://instagram.com/_arsu.x', '_blank'); 
    });
    document.getElementById('tiktokLink')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        window.open('https://tiktok.com/@my.ville', '_blank'); 
    });
    document.getElementById('githubLink')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        window.open('https://github.com/Arfadh-Subhan', '_blank'); 
    });
}

function showToast(message) {
    let toast = document.getElementById('gameToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gameToast';
        toast.style.cssText = `
            position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: #000000; color: #FFE87C; padding: 0.6rem 1.2rem;
            border-radius: 40px; font-size: 0.8rem; font-weight: 500;
            z-index: 1100; transition: transform 0.3s; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    toastTimeout = setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2000);
}
