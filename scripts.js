document.getElementById("startBtn").addEventListener("click", () => {
    const nb = parseInt(document.getElementById("nbRings").value);

    const tower1 = document.querySelector("#tower-1 .stack");
    const towers = document.querySelectorAll(".stack");

    // vider toutes les tours
    towers.forEach(t => t.innerHTML = "");

    // générer les anneaux
    for (let i = nb; i >= 1; i--) {
        const ring = document.createElement("div");
        ring.classList.add("ring");

        // largeur basée sur la taille de l’anneau
        ring.style.width = (20 + i * 15) + "px";

        //  afficher le numéro de l’anneau dessus
        ring.textContent = i;

        // centrer le texte
        ring.style.display = "flex";
        ring.style.justifyContent = "center";
        ring.style.alignItems = "center";
        ring.style.fontWeight = "bold";
        ring.style.color = "white";

        tower1.appendChild(ring);
    }
});
