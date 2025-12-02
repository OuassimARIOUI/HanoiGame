let towers = [[], [], []];
let selectedRing = null;
let moves = 0;
let autoMode = false;

const diskInput = document.getElementById("diskInput");
const startBtn = document.getElementById("startBtn");
const autoBtn = document.getElementById("autoBtn");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");

const moveSpan = document.getElementById("movesCount");
const optimalSpan = document.getElementById("optimalCount");

const victoryModal = document.getElementById("victoryModal");
const towersDOM = document.querySelectorAll(".tower");


/* ============================
   START GAME
============================ */
startBtn.onclick = () => {
    initGame();
};

resetBtn.onclick = () => {
    initGame();
};

themeBtn.onclick = () => {
    document.body.classList.toggle("light");
};


function initGame() {
    moves = 0;
    autoMode = false;
    moveSpan.textContent = moves;

    const n = Number(diskInput.value);
    optimalSpan.textContent = Math.pow(2, n) - 1;

    towers = [[], [], []];

    // Place disks in tower 0
    for (let i = n; i >= 1; i--) {
        towers[0].push(i);
    }

    render();
    closeVictory();
}


/* ============================
   RENDER FUNCTION
============================ */
function render() {
    towersDOM.forEach((tower, i) => {
        tower.innerHTML = "";
        towers[i].forEach(size => {
            const div = document.createElement("div");
            div.className = "ring";
            div.style.width = `${40 + size * 20}px`;
            div.textContent = size;
            div.dataset.size = size;
            tower.appendChild(div);
        });
    });
}


/* ============================
   INTERACTION (CLICK)
============================ */
towersDOM.forEach(tower => {
    tower.onclick = () => {
        if (autoMode) return;

        const id = Number(tower.dataset.id);
        const top = towers[id][towers[id].length - 1];

        if (!selectedRing) {
            if (top) {
                selectedRing = { size: top, from: id };
                highlightRing(top);
            }
        } else {
            attemptMove(selectedRing.from, id);
            selectedRing = null;
            removeHighlights();
        }
    };
});

function highlightRing(size) {
    document.querySelectorAll(".ring").forEach(r => {
        if (Number(r.dataset.size) === size) r.classList.add("selected");
    });
}

function removeHighlights() {
    document.querySelectorAll(".ring").forEach(r => {
        r.classList.remove("selected");
    });
}


/* ============================
   MOVE LOGIC
============================ */
function attemptMove(from, to) {
    if (from === to) return;

    const ring = towers[from][towers[from].length - 1];
    const topDest = towers[to][towers[to].length - 1];

    if (!ring) return;
    if (topDest && topDest < ring) return;

    towers[from].pop();
    towers[to].push(ring);

    moves++;
    moveSpan.textContent = moves;

    render();
    checkVictory();
}


/* ============================
   AUTO MODE (RECURSIVE)
============================ */
autoBtn.onclick = () => {
    initGame();
    autoMode = true;

    const n = Number(diskInput.value);
    const sequence = [];

    solveHanoi(n, 0, 2, 1, sequence);
    playSequence(sequence);
};

function solveHanoi(n, from, to, aux, seq) {
    if (n === 0) return;
    solveHanoi(n - 1, from, aux, to, seq);
    seq.push([from, to]);
    solveHanoi(n - 1, aux, to, from, seq);
}

async function playSequence(sequence) {
    for (let [from, to] of sequence) {
        attemptMove(from, to);
        await delay(400);
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));


/* ============================
   VICTORY
============================ */
function checkVictory() {
    const n = Number(diskInput.value);
    if (towers[2].length === n) {
        showVictory();
    }
}

function showVictory() {
    victoryModal.classList.remove("hidden");
    setTimeout(() => victoryModal.classList.add("hidden"), 6000);
}

function closeVictory() {
    victoryModal.classList.add("hidden");
}
