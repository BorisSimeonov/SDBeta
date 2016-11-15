
function EnvironmentObject(bgCanvasId, mainCanvasId) {
    this.shoot = false;               //used for the continuous shooting
    this.direction = 'static';
    this.shipImageLink = [
        "images/playerShips/ship1.png",
        "images/playerShips/ship2.png",
        "images/playerShips/ship3.png",
        "images/playerShips/ship4.png",
        "images/playerShips/ship5.png",
        "images/playerShips/ship6.png",
        "images/playerShips/ship7.png"];
    this.enemyImageLink = [
        "images/enemyObjects/threat1.png",
        "images/enemyObjects/threat2.png",
        "images/enemyObjects/threat3.png",
        "images/enemyObjects/threat4.png",
        "images/enemyObjects/threat5.png",
        "images/enemyObjects/threat6.png",
        "images/enemyObjects/threat7.png",
        "images/enemyObjects/threat8.png",
        "images/enemyObjects/threat9.png",
        "images/enemyObjects/threat10.png"];
    this.backgroundCanvas = document.getElementById(bgCanvasId);
    this.mainCanvas = document.getElementById(mainCanvasId);
    this.gameSound = new GameSound();
}