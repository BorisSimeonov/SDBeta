function Player(img, xPos, yPos, height, width) {
    "use strict";
    this.img = img;             //string holder of ship image location
    this.xPos = xPos;
    this.yPos = yPos;
    this.width = width;
    this.height = height;
    this.speed = 7;             //movement speed of the ship in pixels per gameUpdate() execution
    this.power = 0.0;           //starting power of the ship before powerRegenerationRate
    this.maxPower = 100.0;      //maximal power of the ship on current level
    this.shotCost = 20.0;       //power cost of each shot
    this.damage = 12.0;
    //this variable holds the min time in milliseconds between each shot
    this.fireRate = 100;
    //the time of the last made shot
    //(mandatory for the fire rate implementation)
    this.lastShot = new Date().getTime();
    //Regeneration of the power represents the
    //amount of power per gameUpdate() function execution
    this.powerRegenerationRate = 1.0;
    this.level = 1;
    this.shotsFired = 0;
    this.succesfulHitsCount = 0;



}

Player.prototype.getShotAccuracy = function () {
    if(this.shotsFired === 0 || this.succesfulHitsCount === 0) {
        return 0;
    }
    else {
        return Math.floor((this.succesfulHitsCount / this.shotsFired) * 100);
    }
};