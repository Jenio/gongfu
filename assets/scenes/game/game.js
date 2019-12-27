var Config = require("Config");
var missionInfo = require('missions');

// const enemyType = cc.Enum({
//     base: 0,
//     archer: 1,
//     dash2: 2,
//     dash3: 3,
//     bomb: 4,
// });
cc.Class({
    extends: cc.Component,

    properties: {
        //--- UI
        UIManager: cc.Node,
        gameScene: cc.Node,
        playground: cc.Node,
        player: cc.Node,

        passivesContent: cc.Node,

        //--- game Prefabs:
        hurtLabel: cc.Prefab,
        waveBoardPrefab: cc.Prefab,
        waveCompletePrefab: cc.Prefab,

        //--- missions：
        missionData: null,
        waveEnemyNumbers: 0,
        enemyPrefabs: [cc.Prefab],
        enemyArray: [],

        level: 0,
        levelLabel: cc.Label,
        experience: 0,
        expProgress: cc.Sprite,
        levelUp: false,
        gold: 0,
        goldLabel: cc.Label,




    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Config.GP = this;
        cc.director.getPhysicsManager().enabled = true;

    },

    start() {
        this.gameSceneInit();
        this.gameObjectInit();


    },
    gameSceneInit() { },
    gameObjectInit() { },
    gameStart() {
        Config.gameStop = false;

        //---- init ...
        this.UIManager.getComponent('UIManager').showGameScene();
    },
    gameRestart() { },
    gamePause() { },

    generateEnemy(data) {
        for (let i = 0; i < data.length; i++) {
            this.waveEnemyNumbers++;
            let generationData = data[i];
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(generationData.delay),
                    cc.callFunc(function () {
                        let enemy;
                        // switch (generationData.type) {
                        //     case "base":
                        //         enemy = cc.instantiate(this.enemyPrefabs[enemyType['base']]);
                        //         break;
                        //     case "archer":
                        //         enemy = cc.instantiate(this.enemyPrefabs[enemyType['archer']]);
                        //         break;
                        // }
                                enemy = cc.instantiate(this.enemyPrefabs[generationData.type]);

                        enemy.parent = this.playground;
                        enemy.position = this.player.position.add(cc.v2(generationData.positionX, 0));
                        this.enemyArray.push(enemy)
                    }, this)
                )
            );


        }
    },
    gameOver() {
        Config.gameStop=true;
        if(Config.hasReveived){
            //---- gameover
        }else{
            Config.hasReveived=true;
            //--- revive
        }
     },
    missionButtonHandler(event, data) {
        this.startMission(parseInt(data));
    },
    startMission(n) {
        this.missionData = missionInfo[n];
        Config.HPDATA=this.missionData['HPDATA'];
        
        this.wave = 0;
        this.enemyArray = [];
        this.UIManager.getComponent('UIManager').showGameScene();
        this.player.getComponent('player').gameStart();

        this.showWaveLabel(false, 0, () => {
            this.startWave(0);
        })
    },
    missionComplete() {
        this.UIManager.getComponent('UIManager').showMissionScene();
        //---  结算 返回
        Config.gameStop = true;
        console.log('mission complete')
    },
    startWave(n) {
        Config.gameStop = false;
        Config.difficultLevel = Math.floor((n+1) / 5);
        let waveData = this.missionData.data[n];
        this.generateEnemy(waveData);
    },
    showWaveLabel(end, wave, callback) {
        Config.gameStop = true;
        let node = cc.instantiate(this.waveBoardPrefab);
        let label = node.getChildByName('label').getComponent(cc.Label);
        if (end) {
            label.string = `通过关卡`;
        } else {
            label.string = `第${wave + 1}关`;
        }
        node.position = cc.v2(- 800, 0);
        node.parent = this.gameScene;

        let seq = [];
        seq.push(cc.moveBy(.3, cc.v2(800, 0)));
        if (end && wave) {
            seq.push(cc.delayTime(1));
            seq.push(cc.callFunc(function () {
                label.node.runAction(
                    cc.sequence(
                        cc.scaleTo(0.3, 1, 0),
                        cc.callFunc(function () {
                            label.string = `第${wave + 1}关`;
                        }, this),
                        cc.scaleTo(0.3, 1, 1)
                    )
                )
            }, this));
            seq.push(cc.delayTime(.6));
        }
        seq.push(cc.delayTime(1));
        seq.push(cc.moveBy(.3, cc.v2(800, 0)));
        seq.push(cc.callFunc(function () {
            callback();
            node.destroy();
        }, this));
        node.runAction(
            cc.sequence(
                seq
            )
        )
    },
    showLevelUpModal() {
        let comp = this.UIManager.getComponent('UIManager');

        let upgradeObj1 = {
            img: null,
            desc: '吸血低级',
            callback: () => {
                this.showWaveLabel(false, this.wave + 1, () => {
                    this.nextWave();
                    this.player.getComponent('player').setLifeStealSmall();
                })
            }
        }

        let upgradeObj2 = {
            img: null,
            desc: '吸血中级',
            callback: () => {
                this.showWaveLabel(false, this.wave + 1, () => {
                    this.nextWave();
                    this.player.getComponent('player').setLifeStealMiddle();

                })
            }
        }

        let upgradeObj3 = {
            img: null,
            desc: '吸血高级',
            callback: () => {
                this.showWaveLabel(false, this.wave + 1, () => {
                    this.nextWave();
                    this.player.getComponent('player').setLifeStealLarge();

                })
            }
        }

        let upgradeObj4 = {
            img: null,
            desc: '隔山打牛',
            callback: () => {
                this.showWaveLabel(false, this.wave + 1, () => {
                    this.nextWave();
                    this.player.getComponent('player').getLongWaveAbility();

                })
            }
        }



        comp.shwoLevelUpModal([upgradeObj1,upgradeObj2,upgradeObj4]);

    },
    nextWave() {
        this.wave++;
        this.startWave(this.wave)
    },

    getGold(n, position) {
        //---

    },
    getExperience(e) {
        this.experience += e;

        let up = 10;
        if (this.experience > up) {
            this.experience -= up;
            this.level++;
            this.levelUp = true;
        }

    },
    // update (dt) {},
    checkWaveComplete() {
        console.log('check wave,', this.waveEnemyNumbers)
        if (this.waveEnemyNumbers === 0) {
            //--- wave complete
            if (this.wave === this.missionData.waves - 1) {
                this.showWaveLabel(true, false, () => {
                    this.missionComplete();
                })
            } else {
                //---  如果升级，选择技能
                //---  choose up
                let disturb = false;

                let callback;
                if (this.levelUp) {
                    disturb = true;
                    callback = () => {
                        console.log('when levelUp callback')
                        this.showLevelUpModal();
                    }
                } else {
                //---  random Plot

                    if (false) {
                        callback = () => { };
                    } else {

                    }
                }

                if (disturb) {
                    this.showWaveLabel(true, false, () => {
                        callback();
                    })
                } else {
                    this.showWaveLabel(true, this.wave + 1, () => {
                        this.nextWave();
                    })
                }
            }
        }
    },

    showHurtLabel(number, color, position, isCritical) {
        let node = cc.instantiate(this.hurtLabel);
        node.parent = this.playground;
        node.position = position;
        let label = node.getChildByName('label')
        let comp = label.getComponent(cc.Label);
        comp.string = -number;
        label.color = color;
        let criticalBg = node.getChildByName('critical');
        if (isCritical) {
            criticalBg.active = true;
        } else {
            criticalBg.active = false;
        }
        node.scale = 0;
        node.runAction(cc.sequence(
            cc.scaleTo(.2, 1).easing(cc.easeBackOut()),
            cc.moveBy(.2, 0, 50),
            cc.spawn(
                cc.moveBy(.2, 0, 50),
                cc.fadeOut(.2),
            ),
            cc.callFunc(function () {
                node.destroy();
            }, this)
        ))
    },
    showHealLabel(number, color, position) {
        let node = cc.instantiate(this.hurtLabel);
        node.parent = this.playground;
        node.position = position;
        let label = node.getChildByName('label')
        let comp = label.getComponent(cc.Label);
        comp.string = '+' + number;
        label.color = color;

        let criticalBg = node.getChildByName('critical');
        criticalBg.active = false;

        node.scale = 0;
        node.runAction(cc.sequence(
            cc.scaleTo(.2, 1).easing(cc.easeBackOut()),
            cc.moveBy(.2, 0, 50),
            cc.spawn(
                cc.moveBy(.2, 0, 50),
                cc.fadeOut(.2),
            ),
            cc.callFunc(function () {
                node.destroy();
            }, this)
        ))
    },
});
