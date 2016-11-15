
function GameObject(health = 200, width = 80, height = 80, score = 0,
                    enemySpawnRate = 1000, bulletSpeed = 10,
                    bulletWidth = 18, bulletHeight = 52, paused = false)
{
    this.earthHealth = health;
    this.enemyDrawWidth = width;
    this.enemyDrawHeight = height;
    this.enemySpawnRate = enemySpawnRate;   //in milliseconds
    this.enemyObjectsHolder = [];
    this.bulletObjectHolder = [];
    this.gameScore = score;
    this.paused = paused;

    this.lastEnemySpawnTime = new Date().getTime();
    this.bulletSpeed = bulletSpeed;
    this.bulletWidth = bulletWidth;
    this.bulletHeight = bulletHeight;
    this.pointsPerKill = 100;
    this.enemyDamageMultiplier = 10;
    this.healingEnemyIndex = 3;
    this.playerShipEvolveRate = 5; //in levels
    this.milestoneMessageDefaultDuration = 3000; //in Milliseconds
    this.playerDamagePerLevel = function(level) {
        return Math.floor(25 * (level/2));
    }
}


GameObject.prototype.enemyHealth = function(playerLevel) {
    return 20 + Math.pow(playerLevel,2);
};

GameObject.prototype.playerDamagePerLevel = function(level) {

};