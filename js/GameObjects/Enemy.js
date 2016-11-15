function Enemy(xPos, health, damage, image, speed, isHealing) {
    "use strict";
    this.image = image;
    this.xPos = xPos;
    this.yPos = 0;
    this.health = health;
    this.damage = damage;
    this.speed = speed;
    this.isHealing = isHealing;
}