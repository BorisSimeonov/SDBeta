/**
 * Created by Boris on 9/25/2016.
 */
function eventWindowLoaded() {

    $("#start").click(function () {
        var game = new SpaceDefenderApp;
        $(".modal").hide();
        $(this).attr("id", "resume");
        $(this).text("Resume");
        ($(".control_window li").length == 1)?$(".control_window li:first-child").after("<li><a id='exit'>Exit</a></li>"):"";

        $("#exit").click(function () {
            $(".modal").hide();
        });
    });
}


function SpaceDefenderApp() {
    "use strict";
    var self = this;
    this.gameData = new GameObject();//the object holds all game data variables
    this.gameEnvironment = new EnvironmentObject('main', 'player');
    this.bgContext = this.gameEnvironment.backgroundCanvas.getContext('2d');          //context of the background canvas
    this.mainContext = this.gameEnvironment.mainCanvas.getContext('2d');     //context of the main drawing canvas
    this.backgroundImage = new Image();
    this.backgroundImage.src = "images/backgroundImages/bgStart.jpg";
    this.backgroundImage.onload = function () {
        self.bgContext.drawImage(self.backgroundImage, 0, 0,
            self.gameEnvironment.backgroundCanvas.width,
            self.gameEnvironment.backgroundCanvas.height);
    };
    this.player = new Player(this.gameEnvironment.shipImageLink[0],
        this.gameEnvironment.backgroundCanvas.width / 2 - 35,
        this.gameEnvironment.backgroundCanvas.height - 80, 69, 70);
    this.playerShipImage = new Image();
    this.playerShipImage.src = this.player.img;
    this.bulletImage = new Image();
    this.bulletImage.src = "images/shots/blueFlame.png";
    this.modal = $(".modal");
    this.milestoneMessageHolder = [];


    document.getElementById("gameBody").addEventListener('keydown', function keyDownHandler(e) {
        let keyCode = e.keyCode;
        if (keyCode == '37') {
            self.gameEnvironment.direction = "left";
        } else if (keyCode == '39') {
            self.gameEnvironment.direction = "right";
        } else if (keyCode == 83 && self.player.power >= self.player.shotCost) {
            self.gameEnvironment.shoot = true;
        }
    });

    document.getElementById("gameBody").addEventListener('keyup', function keyUpHandler(e) {
        let keyCode = e.keyCode;
        if (keyCode == '37') {
            self.gameEnvironment.direction =
                (self.gameEnvironment.direction === "left") ?
                    "static" : self.gameEnvironment.direction;
        } else if (keyCode == '39') {
            self.gameEnvironment.direction =
                (self.gameEnvironment.direction === "right") ?
                    "static" : self.gameEnvironment.direction;
        } else if (keyCode == 83) {
            self.gameEnvironment.shoot = false;
        } else if(keyCode == 27) {
            if (self.gameData.paused == false) {
                self.gameData.paused = true;
                self.modal.show();
                self.modal.find("#resume").click(function () {
                    self.resumeGame();
                });
            }
            else {
                self.resumeGame();
            }
        }
    });

    this.recursiveAnimation();      //entry point of the recursive main loop
}


SpaceDefenderApp.prototype.recursiveAnimation = function () {
    if (this.gameData.earthHealth > 0) {
        if (this.gameData.paused != true) {
            this.loopGame();
            //this.animationFrame(this.recursiveAnimation.bind(this));
            requestAnimationFrame($.proxy(function() {this.recursiveAnimation()}, this));
        }
    } else {
        this.gameOver();
    }
};
SpaceDefenderApp.prototype.loopGame = function () {
    this.drawScene();
    this.detectCollisions();
    this.updateGame();
};
SpaceDefenderApp.prototype.updateGame = function () {
        //Player ship movement update
        if(this.gameEnvironment.direction == "left") {
            this.player.xPos += (this.player.xPos - this.player.speed >= 0) ?
                -this.player.speed : 0;
        } else if(this.gameEnvironment.direction == "right") {
            this.player.xPos += (this.player.xPos + this.player.speed <=
            this.gameEnvironment.mainCanvas.width - this.player.width) ?
                this.player.speed : 0;
        }

        if(this.player.power < this.player.maxPower) {
            this.player.power += (this.player.power + this.player.powerRegenerationRate <=
            this.player.maxPower) ? this.player.powerRegenerationRate : 0.0;
        }

        //Bullet spawn logic and validation of the time, that is passed
        // since last bullet creation and bullet spawn value in gameData object
        let dateImMs = new Date().getTime();
        if(this.gameEnvironment.shoot) {
            if(this.player.power >= this.player.shotCost &&
                (dateImMs - this.player.lastShot >= this.player.fireRate)) {
                this.gameData.bulletObjectHolder.push(
                    new Bullet(this.player.xPos + this.player.width/2 - 9, this.player.yPos - 45));
                this.player.power -= this.player.shotCost;
                this.player.lastShot = dateImMs;
                ++this.player.shotsFired;
                this.gameEnvironment.gameSound.shotSound.play();
            }
        }

        //Enemy spawn logic and validation of the time, that is passed
        // since last enemy creation and enemy spawn value in gameData object
        if(dateImMs - this.gameData.lastEnemySpawnTime >= this.gameData.enemySpawnRate) {
            let xPos = this.gameData.enemyDrawWidth + parseInt(Math.random() *
                    (this.gameEnvironment.mainCanvas.width - this.gameData.enemyDrawWidth*2));
            let image = new Image();
            let enemyIdx = Math.floor(Math.random() * 10);
            let healingEnemy = (enemyIdx == this.gameData.healingEnemyIndex);
            image.src = this.gameEnvironment.enemyImageLink[enemyIdx];
            let enemyDamage = (healingEnemy) ?
                enemyIdx + this.gameData.enemyDamageMultiplier :
                -((enemyIdx+1) * this.gameData.enemyDamageMultiplier);
            let speed = 2.0 - ((enemyIdx+1)*0.1);

            this.gameData.enemyObjectsHolder.push(
                new Enemy(xPos, this.gameData.enemyHealth(this.player.level),enemyDamage,
                    image, speed, healingEnemy));
            this.gameData.lastEnemySpawnTime = dateImMs;
        }
        //Update player level
        if(this.gameData.gameScore >= Math.pow(this.player.level, 2) * 100) {
            this.playerLevelUp();
        }
        //Remove expired messages from the message holder
       if(this.milestoneMessageHolder.length > 0 &&
       this.milestoneMessageHolder[0].firstDisplayTime +
       this.gameData.milestoneMessageDefaultDuration <
       dateImMs ) {
           this.milestoneMessageHolder.splice(0,1);
       }
    };
SpaceDefenderApp.prototype.detectCollisions = function() {
    var self = this;
    for (let aIdx = 0; aIdx < self.gameData.enemyObjectsHolder.length; ++aIdx) {
        for (let sIdx = 0; sIdx < self.gameData.bulletObjectHolder.length; ++sIdx) {
            if (
                (self.gameData.enemyObjectsHolder[aIdx].xPos <= self.gameData.bulletObjectHolder[sIdx].xPos &&
                self.gameData.enemyObjectsHolder[aIdx].xPos + self.gameData.enemyDrawWidth >=
                self.gameData.bulletObjectHolder[sIdx].xPos)
                &&
                (self.gameData.enemyObjectsHolder[aIdx].yPos <= self.gameData.bulletObjectHolder[sIdx].yPos &&
                self.gameData.enemyObjectsHolder[aIdx].yPos + self.gameData.enemyDrawHeight >=
                self.gameData.bulletObjectHolder[sIdx].yPos)
            ) {
                self.gameData.bulletObjectHolder.splice(sIdx, 1);
                sIdx--;
                self.gameData.enemyObjectsHolder[aIdx].health -= self.player.damage;
                ++self.player.succesfulHitsCount;
                if (self.gameData.enemyObjectsHolder[aIdx].health <= 0) {
                    self.gameData.gameScore += self.gameData.pointsPerKill;
                    self.gameData.enemyObjectsHolder.splice(aIdx, 1);
                    --aIdx;
                    this.gameEnvironment.gameSound.enemyKillSound.play();

                    if (self.gameData.gameScore % 2500 === 0) {
                        let kills =self.gameData.gameScore / 100;
                        let value;
                        switch (kills) {
                            case 25:
                                value = "Rampage!";
                                this.gameEnvironment.gameSound.rampageSound.play();
                                break;
                            case 50:
                                value = "Unstoppable!";
                                this.gameEnvironment.gameSound.unstoppable.play();
                                break;
                            case 75:
                                value = "Monster Kill!";
                                this.gameEnvironment.gameSound.monsterkill.play();
                                break;
                            case 100:
                                value = "Ultra Kill!";
                                this.gameEnvironment.gameSound.ultrakill.play();
                                break;
                            case 125:
                                value = "Wicked Sick!";
                                this.gameEnvironment.gameSound.wickedSick.play();
                                break;
                            default:
                                value = `GODLIKE(x${(kills - 125) / 25})!`;
                                this.gameEnvironment.gameSound.godlike.play();
                                break;

                        }

                        value += `    /${kills} kills/`;
                        this.pushNewMilestoneMessage(value, "#ff0000");
                    }
                    break;
                }
            }
        }
    }
};
SpaceDefenderApp.prototype.playerLevelUp = function() {
    ++this.player.level;
    this.gameEnvironment.gameSound.levelUpSound.play();
    if (this.player.level % 5 == 0) {
        this.changeBackgroundImage();
    }

    this.player.damage += this.gameData.playerDamagePerLevel(
        this.player.level);

    if(this.player.level % this.gameData.playerShipEvolveRate == 0) {
        let shipRankIdx = this.player.level / this.gameData.playerShipEvolveRate;
        if(shipRankIdx < this.gameEnvironment.shipImageLink.length) {
            this.playerShipImage.src = this.gameEnvironment.shipImageLink[shipRankIdx];
            this.pushNewMilestoneMessage(`You have earned a new ship skin.`, "#efefef");
        }
    }
    this.pushNewMilestoneMessage(`Level ${this.player.level} reached. Congratulations!`,
        "#feba00");
};
SpaceDefenderApp.prototype.changeBackgroundImage = function() {
    var self = this;
    let backgroundArr =
        [
            "images/backgroundImages/bg2.jpg",
            "images/backgroundImages/bg3.jpg",
            "images/backgroundImages/bg4.jpg",
            "images/backgroundImages/bg5.jpg",
            "images/backgroundImages/bg6.jpg"
        ];
    let rImageIndex = Math.floor((Math.random() * 5));
    this.bgContext.clearRect(0,0,900,500);
    let newBGImage = new Image();
    newBGImage.src = backgroundArr[rImageIndex];
    newBGImage.onload = function() {
        self.bgContext.drawImage(newBGImage,0,0);
    };
    this.pushNewMilestoneMessage(`You have advanced to another system.`, "#efefef");
};
SpaceDefenderApp.prototype.gameOver = function(){
    location.reload();
};
SpaceDefenderApp.prototype.resumeGame = function() {
    this.gameData.paused = false;
    requestAnimationFrame($.proxy(function() {this.recursiveAnimation()}, this));
    this.modal.hide();
    this.modal.find("#resume").unbind("click");
};
SpaceDefenderApp.prototype.drawBullets = function() {
    for (let idx = 0; idx < this.gameData.bulletObjectHolder.length; ++idx) {
        if (this.gameData.bulletObjectHolder[idx].yPos <= 0) {
            this.gameData.bulletObjectHolder.splice(idx, 1);
            --idx;
        } else {
            this.mainContext.drawImage(this.bulletImage,
                this.gameData.bulletObjectHolder[idx].xPos,
                this.gameData.bulletObjectHolder[idx].yPos,
                this.gameData.bulletWidth,
                this.gameData.bulletHeight);
            this.gameData.bulletObjectHolder[idx].yPos -= this.gameData.bulletSpeed;
        }
    }
};
SpaceDefenderApp.prototype.drawScene = function() {
    this.mainContext.clearRect(0,0,this.gameEnvironment.mainCanvas.width, this.gameEnvironment.mainCanvas.height);
    this.drawInformationalInterface();
    if(this.milestoneMessageHolder.length > 0) {
        this.drawMilestoneText();
    }
    if(this.gameData.bulletObjectHolder.length > 0) {
        this.drawBullets();
    }
    if(this.gameData.enemyObjectsHolder.length > 0) {
        this.drawEnemies();
    }
    this.mainContext.drawImage(this.playerShipImage,this.player.xPos,
        this.player.yPos,this.player.width,this.player.height);

    //<editor-fold desc="---inner draw functions"

    //</editor-fold>
};
SpaceDefenderApp.prototype.drawInformationalInterface = function () {
    this.mainContext.fillStyle = "#000000";
    this.mainContext.fillRect(0,0,190,82);
    this.mainContext.strokeStyle = "#FFFFFF";
    this.mainContext.strokeRect(0,0,190,82);
    this.mainContext.fillStyle = "#FFFFFF";
    this.mainContext.textBaseline = "top";
    this.mainContext.font = "14px Sans-Serif";
    this.mainContext.fillText("Score: " + this.gameData.gameScore , 10, 6);
    this.mainContext.fillText("Level: " + this.player.level , 10, 20);
    this.mainContext.fillText("Power: " + this.player.power , 10, 34);
    this.mainContext.fillText("Damage: " + this.player.damage , 10, 48);
    this.mainContext.fillText("Fire Accuracy: " + this.player.getShotAccuracy() , 10, 62);

    this.mainContext.fillText("Earth's health: " + this.gameData.earthHealth ,
        5, this.gameEnvironment.mainCanvas.height - 50);
    this.mainContext.fillStyle = "#3DE605";
    this.mainContext.fillRect(5,this.gameEnvironment.mainCanvas.height - 30,
        this.gameData.earthHealth, 10);
};
SpaceDefenderApp.prototype.drawMilestoneText = function() {
    let horizontalTextPosition = 200;
    this.mainContext.fillStyle = "#000000";
    this.mainContext.fillRect(191,0,this.gameEnvironment.mainCanvas.width,30);
    this.mainContext.fillStyle = this.milestoneMessageHolder[0].textColor;
    this.mainContext.font = "24px Sans-Serif";
    this.mainContext.fillText(this.milestoneMessageHolder[0].text, horizontalTextPosition, 3);
    if(this.milestoneMessageHolder[0].firstDisplayTime == undefined) {
        let date = new Date();
        this.milestoneMessageHolder[0].firstDisplayTime = date.getTime();
    }
};
SpaceDefenderApp.prototype.drawEnemies = function() {
    for(let i = 0; i < this.gameData.enemyObjectsHolder.length; ++i) {
        if(this.gameData.enemyObjectsHolder[i].yPos + this.gameData.enemyObjectsHolder[i].speed
            <= this.gameEnvironment.mainCanvas.height) {
            this.mainContext.drawImage(this.gameData.enemyObjectsHolder[i].image,
                this.gameData.enemyObjectsHolder[i].xPos,
                this.gameData.enemyObjectsHolder[i].yPos,
                this.gameData.enemyDrawWidth,
                this.gameData.enemyDrawHeight);

            this.gameData.enemyObjectsHolder[i].yPos += this.gameData.enemyObjectsHolder[i].speed;
        } else {
            if(this.gameData.enemyObjectsHolder[i].isHealing == true && this.gameData.earthHealth +
                this.gameData.enemyObjectsHolder[i].damage >= 200) {
                this.gameData.earthHealth = 200;
            } else {
                this.gameData.earthHealth += this.gameData.enemyObjectsHolder[i].damage;
            }

            this.gameData.enemyObjectsHolder.splice(i,1);
            i--;
        }
    }
};
SpaceDefenderApp.prototype.pushNewMilestoneMessage = function(text, color) {
    this.milestoneMessageHolder.push({
        text: text,
        firstDisplayTime: undefined,
        textColor: color
    });
    console.log(this.milestoneMessageHolder);
};

