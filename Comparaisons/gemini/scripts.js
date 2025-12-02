document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & DOM Elements ---
    const towers = document.querySelectorAll('.tower-container');
    const diskCountInput = document.getElementById('diskCount');
    const moveCountDisplay = document.getElementById('moveCount');
    const minMovesDisplay = document.getElementById('minMoves');
    const btnStart = document.getElementById('btnStart');
    const btnReset = document.getElementById('btnReset');
    const btnAuto = document.getElementById('btnAuto');
    const btnTheme = document.getElementById('btnTheme');
    
    // Modal Elements
    const victoryModal = document.getElementById('victoryModal');
    const modalMovesDisplay = document.getElementById('modalMoves');
    const modalTimerBar = document.querySelector('.modal-timer-bar');

    // State Variables
    let gameState = {
        disks: 4,
        moves: 0,
        selectedDisk: null,
        sourceTower: null,
        isSolving: false, // Bloque les interactions pendant l'auto-solve
        isActive: false
    };

    // --- Initialisation ---

    // Calcul des couleurs pour un joli dégradé (HSL)
    function getDiskColor(index, total) {
        const hue = 200 + (index * 40); // Nuances de bleus/violets
        return `linear-gradient(90deg, hsl(${hue}, 70%, 50%), hsl(${hue + 20}, 70%, 60%))`;
    }

    function initGame() {
        // Reset State
        gameState.disks = parseInt(diskCountInput.value);
        gameState.moves = 0;
        gameState.selectedDisk = null;
        gameState.sourceTower = null;
        gameState.isSolving = false;
        gameState.isActive = true;

        // Reset UI
        moveCountDisplay.textContent = '0';
        minMovesDisplay.textContent = Math.pow(2, gameState.disks) - 1; // 2^n - 1
        
        // Vider les tours
        towers.forEach(t => {
            const container = t.querySelector('.disks-container');
            container.innerHTML = '';
            // Reset visuel de sélection si présent
            const towerId = t.querySelector('.tower').dataset.id;
            // Retirer classe selected si elle traîne (cas rare)
        });

        // Créer les anneaux sur la Tour 1
        const tower1 = document.getElementById('tower-1').querySelector('.disks-container');
        
        for (let i = gameState.disks; i >= 1; i--) {
            const disk = document.createElement('div');
            disk.classList.add('disk');
            disk.dataset.value = i;
            disk.textContent = i;
            
            // Largeur relative : le plus petit 30%, le plus grand 90%
            const width = 25 + ((i / gameState.disks) * 65);
            disk.style.width = `${width}%`;
            disk.style.background = getDiskColor(i, gameState.disks);
            
            // Ajout au DOM
            // Note: Avec flex-direction: column-reverse, appendChild met l'élément "visuellement" en haut de la pile si c'est le dernier ajouté
            // Mais pour Hanoï classique html structure, on veut que le plus grand (N) soit au fond.
            // Avec column-reverse: le 1er enfant est en BAS. Donc on doit insérer du plus grand au plus petit ?
            // Non, avec column-reverse, le 1er enfant DOM est en bas visuellement.
            // Donc pour avoir [Grand, Moyen, Petit] de bas en haut :
            // DOM: [Grand, Moyen, Petit] -> CSS affiche Grand en bas.
            // Ma boucle va de N à 1. Donc je dois prepend ? Non.
            // Boucle: i=4 (Grand). appendChild -> DOM contient [4]. Visuel: 4 en bas.
            // Boucle: i=3. appendChild -> DOM contient [4, 3]. Visuel: 3 sur 4.
            // C'est correct.
            tower1.appendChild(disk);
        }
    }

    // --- Logique d'Interaction (Click) ---

    towers.forEach(towerWrapper => {
        towerWrapper.addEventListener('click', () => {
            if (!gameState.isActive || gameState.isSolving) return;

            const tower = towerWrapper.querySelector('.tower');
            const diskContainer = tower.querySelector('.disks-container');
            const topDisk = diskContainer.lastElementChild; // Le disque du haut visuellement (dernier dans le DOM)

            // Cas 1 : Sélection d'un disque
            if (!gameState.selectedDisk) {
                if (topDisk) {
                    selectDisk(topDisk, tower);
                }
            } 
            // Cas 2 : Tentative de déplacement ou désélection
            else {
                // Si on clique sur la même tour -> Désélectionner
                if (gameState.sourceTower === tower) {
                    deselectDisk();
                } 
                // Si on clique sur une autre tour -> Tenter le déplacement
                else {
                    if (isValidMove(gameState.selectedDisk, topDisk)) {
                        moveDisk(gameState.selectedDisk, diskContainer);
                    } else {
                        // Feedback visuel erreur (optionnel) : Secousse ?
                        // Pour l'instant, on désélectionne juste pour simplifier l'UX ou on ne fait rien
                        // UX Choice: On ne fait rien pour laisser l'utilisateur réessayer ailleurs sans re-cliquer
                        blinkError(towerWrapper);
                    }
                }
            }
        });
    });

    function selectDisk(disk, tower) {
        gameState.selectedDisk = disk;
        gameState.sourceTower = tower;
        disk.classList.add('selected');
    }

    function deselectDisk() {
        if (gameState.selectedDisk) {
            gameState.selectedDisk.classList.remove('selected');
            gameState.selectedDisk = null;
            gameState.sourceTower = null;
        }
    }

    function isValidMove(diskToMove, targetTopDisk) {
        if (!targetTopDisk) return true; // Tour vide acceptée
        const moveVal = parseInt(diskToMove.dataset.value);
        const targetVal = parseInt(targetTopDisk.dataset.value);
        return moveVal < targetVal; // Petit sur grand uniquement
    }

    function moveDisk(disk, targetContainer) {
        // Animation CSS clean : retirer la classe selected
        disk.classList.remove('selected');
        
        // Déplacement effectif dans le DOM
        targetContainer.appendChild(disk);
        
        // Ajouter une petite animation de chute
        disk.classList.remove('animate-drop'); // Reset animation
        void disk.offsetWidth; // Trigger reflow
        disk.classList.add('animate-drop');

        // Mise à jour stats
        gameState.moves++;
        moveCountDisplay.textContent = gameState.moves;

        // Reset state
        gameState.selectedDisk = null;
        gameState.sourceTower = null;

        checkVictory();
    }

    function blinkError(element) {
        element.style.background = "rgba(255, 0, 0, 0.2)";
        setTimeout(() => {
            element.style.background = "";
        }, 200);
    }

    // --- Victoire ---

    function checkVictory() {
        const tower3Count = document.getElementById('tower-3').querySelector('.disks-container').childElementCount;
        if (tower3Count === gameState.disks) {
            showVictory();
        }
    }

    function showVictory() {
        gameState.isActive = false;
        modalMovesDisplay.textContent = gameState.moves;
        victoryModal.classList.remove('hidden');
        
        // Reset la barre de timer (CSS hack pour relancer l'anim)
        modalTimerBar.style.transition = 'none';
        modalTimerBar.style.transform = 'scaleX(1)'; // Pleine
        void modalTimerBar.offsetWidth; // Reflow
        modalTimerBar.style.transition = 'transform 6s linear';
        modalTimerBar.style.transform = 'scaleX(0)'; // Vide

        // Fermeture auto après 6s
        setTimeout(() => {
            closeModal();
        }, 6000);
    }

    function closeModal() {
        victoryModal.classList.add('hidden');
    }

    // --- Algorithme de Résolution Automatique ---

    // Structure pour stocker les mouvements : { from: 1, to: 3 }
    let autoMoves = [];

    function hanoiAlgorithm(n, from, to, aux) {
        if (n === 0) return;
        hanoiAlgorithm(n - 1, from, aux, to);
        autoMoves.push({ from, to });
        hanoiAlgorithm(n - 1, aux, to, from);
    }

    async function runAutoSolve() {
        if (gameState.isSolving) return;

        // 1. Reset Game proprement
        initGame();
        gameState.isSolving = true;
        btnAuto.disabled = true;
        btnStart.disabled = true;

        // 2. Générer les mouvements
        autoMoves = [];
        // Mapping des IDs de tours : 1, 2, 3
        hanoiAlgorithm(gameState.disks, 1, 3, 2);

        // 3. Exécuter les mouvements avec délai
        for (let move of autoMoves) {
            await new Promise(resolve => setTimeout(resolve, 600)); // Vitesse d'animation
            
            const fromContainer = document.querySelector(`#tower-${move.from} .disks-container`);
            const toContainer = document.querySelector(`#tower-${move.to} .disks-container`);
            const disk = fromContainer.lastElementChild;

            if (disk) {
                // Simuler la sélection visuelle (rapide)
                disk.classList.add('selected');
                await new Promise(r => setTimeout(r, 100));
                
                // Déplacement
                moveDisk(disk, toContainer);
            }
        }

        gameState.isSolving = false;
        btnAuto.disabled = false;
        btnStart.disabled = false;
    }

    // --- Event Listeners Boutons ---

    btnStart.addEventListener('click', initGame);
    
    btnReset.addEventListener('click', initGame); // Reset = Start logic here

    btnAuto.addEventListener('click', runAutoSolve);

    // Changement de Thème
    btnTheme.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        btnTheme.textContent = newTheme === 'dark' ? '🌗' : '🌞';
    });

    // Close modal on click (si l'utilisateur veut fermer avant 6s)
    victoryModal.addEventListener('click', closeModal);

    // Initialisation au chargement
    initGame();
});