let selectedRing = null;
let moveCount = 0;

// ELEMENTS UI
const moveCountEl      = document.getElementById("moveCount");
const optimalMovesEl   = document.getElementById("optimalMoves");
const victoryMessageEl = document.getElementById("victoryMessage");

// =====================================================
// GÉNÉRATION DES ANNEAUX
// =====================================================
document.getElementById("startBtn").addEventListener("click", () => {
    const nb = parseInt(document.getElementById("nbRings").value);
    resetGame(nb);
});


// =====================================================
// RESET GAME
// =====================================================
document.getElementById("resetBtn").addEventListener("click", () => {
    const nb = parseInt(document.getElementById("nbRings").value);
    resetGame(nb);
});

function resetGame(nb) {
    moveCount = 0;
    moveCountEl.textContent = 0;
    victoryMessageEl.style.display = "none";

    // Score optimal : 2^n - 1
    optimalMovesEl.textContent = Math.pow(2, nb) - 1;

    const allStacks = document.querySelectorAll(".stack");
    const tower1 = document.querySelector("#tower-1 .stack");

    // vider toutes les tours
    allStacks.forEach(t => t.innerHTML = "");

    // générer les anneaux
    for (let i = nb; i >= 1; i--) {
        const ring = document.createElement("div");
        ring.classList.add("ring");
        ring.style.width = (20 + i * 15) + "px";
        ring.textContent = i;
        tower1.appendChild(ring);
    }

    selectedRing = null;
}


// =====================================================
// THEME SOMBRE / CLAIR
// =====================================================
document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});


// =====================================================
// ÉCOUTEUR GLOBAL SUR LE GAMEAREA
// =====================================================
const gameArea = document.getElementById("gameArea");

gameArea.addEventListener("click", (e) => {

    if (e.target.classList.contains("ring")) {
        handleRingClick(e.target);
        return;
    }

    if (e.target.classList.contains("tower")) {
        handleTowerClick(e.target);
        return;
    }

    if (e.target.classList.contains("stack")) {
        handleTowerClick(e.target.parentElement);
        return;
    }
});


// =====================================================
// SÉLECTION D’UN ANNEAU
// =====================================================
function handleRingClick(ring) {
    const stack = ring.parentElement;
    const topRing = stack.lastElementChild;

    // seulement l’anneau du haut peut être pris
    if (ring !== topRing) return;

    if (selectedRing === ring) {
        ring.classList.remove("selected");
        selectedRing = null;
        return;
    }

    if (selectedRing) selectedRing.classList.remove("selected");

    selectedRing = ring;
    ring.classList.add("selected");
}


// =====================================================
// DÉPLACEMENT VERS UNE TOUR
// =====================================================
function handleTowerClick(tower) {
    if (!selectedRing) return;

    const targetStack = tower.querySelector(".stack");
    const topTargetRing = targetStack.lastElementChild;

    const sizeSelected = parseInt(selectedRing.textContent);

    // règle : pas de grand sur petit
    if (topTargetRing) {
        const sizeTarget = parseInt(topTargetRing.textContent);

        if (sizeSelected > sizeTarget) {
            console.log("❌ Impossible de déposer un grand sur un petit !");
            return;
        }
    }

    // sauvegarder l’anneau avant de le remettre à null
    const ring = selectedRing;

    ring.classList.add("move");

    setTimeout(() => {
        // déplacement réel
        ring.parentElement.removeChild(ring);
        targetStack.appendChild(ring);
        ring.classList.remove("move");

        // déselection
        ring.classList.remove("selected");
        selectedRing = null;

        // incrément compteur
        moveCount++;
        document.getElementById("moveCount").textContent = moveCount;

        // vérification victoire
        checkWin();
    }, 150);
}



// =====================================================
// ANIMATION GLISSEMENT FLUIDE
// =====================================================
function animateMove(ring, targetStack) {
    ring.classList.add("moving");

    setTimeout(() => {
        ring.parentElement.removeChild(ring);
        targetStack.appendChild(ring);
        ring.classList.remove("moving");
    }, 250);
}


// =====================================================
// VICTOIRE
// =====================================================
function checkWin() {
    const nb = parseInt(document.getElementById("nbRings").value);
    const finalTower = document.querySelector("#tower-3 .stack");

    if (finalTower.children.length === nb) {

        // texte dans le modal
        document.getElementById("victoryText").textContent =
            `🎉 Bravo ! Vous avez gagné en ${moveCount} coups !`;

        // afficher le modal
        const modal = document.getElementById("victoryModal");
        modal.classList.remove("hidden");

        // disparaît automatiquement après 6 secondes
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 6000);
    }
}



// =====================================================
// AUTO SOLVE : RÉSOLUTION AUTOMATIQUE
// =====================================================
document.getElementById("autoBtn").addEventListener("click", () => {
    const n = parseInt(document.getElementById("nbRings").value);

    resetGame(n);

    const moves = [];
    hanoi(n, "tower-1", "tower-3", "tower-2", moves);

    playAuto(moves);
});

function hanoi(n, from, to, aux, moves) {
    if (n === 0) return;
    hanoi(n - 1, from, aux, to, moves);
    moves.push([from, to]);
    hanoi(n - 1, aux, to, from, moves);
}

function playAuto(moves, index = 0) {
    if (index >= moves.length) return;

    const [from, to] = moves[index];

    moveOneRing(from, to, () => {
        moveCount++;
        moveCountEl.textContent = moveCount;
        setTimeout(() => playAuto(moves, index + 1), 350);
    });
}

function moveOneRing(fromId, toId, callback) {
    const fromStack = document.querySelector(`#${fromId} .stack`);
    const toStack = document.querySelector(`#${toId} .stack`);

    const ring = fromStack.lastElementChild;
    if (!ring) return callback();

    animateMove(ring, toStack);
    setTimeout(callback, 300);
}
