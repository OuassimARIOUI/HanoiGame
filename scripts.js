let selectedRing = null;

// ===========================
// GÉNÉRATION DES ANNEAUX
// ===========================
document.getElementById("startBtn").addEventListener("click", () => {
    const nb = parseInt(document.getElementById("nbRings").value);

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
});

// ===========================
// ÉCOUTEUR GLOBAL SUR LE GAMEAREA
// ===========================
const gameArea = document.getElementById("gameArea");

gameArea.addEventListener("click", (e) => {

    // 1️⃣ Si on clique sur un ANNEAU
    if (e.target.classList.contains("ring")) {
        handleRingClick(e.target);
        return;
    }

    // 2️⃣ Si on clique sur une TOUR
    if (e.target.classList.contains("tower")) {
        handleTowerClick(e.target);
        return;
    }

    // 3️⃣ Si on clique sur la STACK (fond interne)
    if (e.target.classList.contains("stack")) {
        handleTowerClick(e.target.parentElement);
        return;
    }
});
    

// ===========================
// SÉLECTION D’UN ANNEAU
// ===========================
function handleRingClick(ring) {
    const stack = ring.parentElement;
    const topRing = stack.lastElementChild;

    // seulement l’anneau du haut peut être pris
    if (ring !== topRing) return;

    // si il est déjà sélectionné → on le déselectionne
    if (selectedRing === ring) {
        ring.classList.remove("selected");
        selectedRing = null;
        return;
    }

    // sinon on le sélectionne
    if (selectedRing) selectedRing.classList.remove("selected");

    selectedRing = ring;
    ring.classList.add("selected");
}


// ===========================
// DÉPLACEMENT VERS UNE TOUR
// ===========================
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

    // déplacement
    selectedRing.parentElement.removeChild(selectedRing);
    targetStack.appendChild(selectedRing);

    selectedRing.classList.remove("selected");
    selectedRing = null;

     // ⚡ Ajout animation
    selectedRing.classList.add("move");

    setTimeout(() => {
        selectedRing.parentElement.removeChild(selectedRing);
        targetStack.appendChild(selectedRing);

        selectedRing.classList.remove("selected");
        selectedRing.classList.remove("move");
        selectedRing = null;

    }, 150); // léger délai pour la fluidité
}

document.getElementById("autoBtn").addEventListener("click", () => {
    const n = parseInt(document.getElementById("nbRings").value);

    // toujours recommencer avec une configuration propre
    document.getElementById("startBtn").click();

    // Lancer l'animation pas à pas
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
        setTimeout(() => playAuto(moves, index + 1), 300);
    });
}

function moveOneRing(fromId, toId, callback) {
    const fromStack = document.querySelector(`#${fromId} .stack`);
    const toStack   = document.querySelector(`#${toId} .stack`);

    const ring = fromStack.lastElementChild;
    if (!ring) return callback();

    ring.classList.add("move");

    setTimeout(() => {
        fromStack.removeChild(ring);
        toStack.appendChild(ring);
        ring.classList.remove("move");
        callback();
    }, 250);
}

