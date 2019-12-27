var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        attackMode: 0,
        faceRight: 1,
        dodgeFacing: 1,
        camera: cc.Node,
        sprite: cc.Node,

        bgl: cc.Node,
        bg: cc.Node,
        bgr: cc.Node,
        fgl: cc.Node,
        fg: cc.Node,
        fgr: cc.Node,

        attackPrefab: cc.Prefab,
        longWavePrefab: cc.Prefab,
        shortWavePrefab: cc.Prefab,

        attackCoolDown: 0,



        //--- player skills
        passiveLifeSteal: 0,
        passiveLifeStealRate: .3,
        weaponLifeSteal: 0,
        weaponLifeStealRate: .1,


        _longScreenSkill: false,
        longScreenSkillPrefab: cc.Prefab,
        _longScreenSkillCooldown: 0,

        _concentrateAttackSkill: false,
        concentrateAttackSkillPrefab: cc.Prefab,
        _concentrateAttackSkillCooldown: 0,

        _surroundWaves: false,
        surroundWavesPrefab: cc.Prefab,
        _surroundWavesCooldown: 0,

        _bleedAbility: false,
        _poisonAbility: false,

        _shortWaveAbility:false,
        _longWaveAbility:false,
        _backWaveAbility:false,

        attackActionFlag: 0,


        mixTime:.3,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let node = this.node.getChildByName('sprite').getChildByName('spine');;
        var spine = this.spine = node.getComponent('sp.Skeleton');
        this._setMix('a', 'b');
        this._setMix('b', 'c');
        this._setMix('c', 'd');
        this._setMix('d', 'a');
        this._setMix('a', 'daiji');
        this._setMix('b', 'daiji');
        this._setMix('c', 'daiji');
        this._setMix('d', 'daiji');
        this._setMix('daiji', 'a');
        this._setMix('daiji', 'b');
        this._setMix('daiji', 'c');
        this._setMix('daiji', 'd');
        this._setMix('daiji', 'houtui');
        this._setMix('houtui', 'daiji');

        spine.setStartListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            // cc.log("[track %s][animation %s] start.", trackEntry.trackIndex, animationName);

            // console.log(animationName, 'start1,faceRight', this.faceRight)

            if (animationName === 'daiji') {
             

                //     console.log('sprite reserve')
                // }
                // if (this.dodgeFacing) {
                //     console.log('sprite reserve ,',this.dodgeFacing)
                //     this.faceRight = this.dodgeFacing;
                //     this.sprite.scaleX = this.faceRight;
                //     this.dodgeFacing=0;
                // }
            }
            // console.log(animationName, 'start2,faceRight', this.faceRight)


        });
        spine.setInterruptListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
        });
        spine.setEndListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";

        });
        spine.setDisposeListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
        });
        spine.setCompleteListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            // if (animationName === 'houtui') {
            //     if (this.needReserve) {
            //         this.needReserve = false;
            //         this.sprite.scaleX = - this.faceRight;

            //         console.log('sprite reserve')
            //     }
            // }
            var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
        });
        spine.setEventListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
        });

        this._hasStop = false;
    },
    start() {
        this.playerPropertiesCalculate()

        this.gameInit();

        
    },
    playerPropertiesCalculate() {
        //--- 结算属性
        let playerBaseData = {
            isEnemy: false,
            baseHP: 2000,
            //--- 攻击力
            baseDamage: 220,
            //--- 附加伤害
            additionDamage: 0,
            //--- 伤害减少
            defence: 0,
            //--- 护盾
            shield: 200,
            //--- 暴击率
            criticalRate: 0.1,
            //--- 闪避率
            evade: 0,
            //--- 无敌
            invincible: false,
            //--- 格挡伤害
            blockDamage: 1,
        }
        //---damage
        //---HP
        //---defence
        //---shield when start

        //---criticalRate
        //---evade
        //---blockDamage


        //--------------------------------------
        //---revive time 
        this.reviveTime = 1;
        //---life steal rate
        //---lifestral percent

        //--weapon life steal rate
        //--weapon life steal percent

        this.node.getComponent('combatModule').init(playerBaseData, this)
    },

    gameInit() {
        this.node.x = 0;
        this.bg.x = 0;
        this.fg.x = 0;

        this.bgl.x = this.bg.x - this.bg.width;
        this.bgr.x = this.bg.x + this.bg.width;

        this.fgl.x = this.fg.x - this.fg.width;
        this.fgr.x = this.fg.x + this.fg.width;

    },
    clearSkills() {
        this.dropConcentrateAttackAbility();
        this.dropLongScreenAbility();
        this.dropSurroundWavesAbility();
    },
    gameStart() {
        this.camera.getComponent(cc.Camera).zoomRatio = 1.5;
        cc.tween(this.camera.getComponent(cc.Camera)).to(1, { zoomRatio: 1 }).start();
        this.clearSkills();
    },
    attack() {
        // this.needReserve = false;
        //action
        this['attack' + this.attackActionFlag]();
        this.attackActionFlag++;
        this.dodgeFacing=0;
        if (this.attackActionFlag >= 4) this.attackActionFlag = 0;
        //effect
        //shot wave
        let comp = this.node.getComponent('combatModule');
        comp.attack(this.faceRight, this.attackPrefab, (otherComp) => {
            //--- waves
            //---  武器 特效
            if (this._bleedAbility) otherComp.getBleed(1, 12);
            if (this._poisonAbility) otherComp.getPoison(1, 12);

            //---  技能 特效 
            if (this._longScreenSkill) this._setLongScreenSkill();
            if (this._concentrateAttackSkill) this._setConcentrateAttackSkill();

            if (this._longWaveAbility)this.setLongWave(otherComp.node);
            if (this._shortWaveAbility)this.setShortWave(otherComp.node);
            if (this._backWaveAbility)this.setBackWave();
      
            //--- 生命 偷取
            let lifesteal = 0;
            //---  skill
            let random1 = Math.random();
            if (random1 < this.passiveLifeStealRate) {
                lifesteal += this.passiveLifeSteal;
            }
            let random2 = Math.random();
            if (random2 < this.weaponLifeStealRate) {
                lifesteal += this.weaponLifeSteal;
            }
            comp.getHealed(lifesteal);

        })


        //-----something else
    },

    dodge() {
        //---  animation
        // // this.needReserve=true;
        // this.dodgeFacing = -this.faceRight;

                    this.faceRight = -this.faceRight;
                    this.sprite.scaleX = this.faceRight;


        console.log('dodgefacing:',this.dodgeFacing)
        this.spine.setAnimation(0, 'houtui', false);
        this.spine.addAnimation(0, 'daiji', true, 0);
    },
    checkEnemyPosition() {
        this.haveRightEnemy = 0;
        this.haveLeftEnemy = 0;
        let p1 = this.node.parent.convertToWorldSpaceAR(this.node.position.add(cc.v2(0, 30)))
        let p2 = p1.add(cc.v2(1800, 0));
        let p3 = p1.add(cc.v2(-1800, 0));
        var resultsRight = cc.director.getPhysicsManager().rayCast(p1, p2, cc.RayCastType.Closest);
        for (var i = 0; i < resultsRight.length; i++) {
            var result = resultsRight[i];
            var collider = result.collider;
            var point = result.point;
            var normal = result.normal;
            var fraction = result.fraction;
            if (collider.node.group === 'enemy') {
                this.haveRightEnemy = point.x - p1.x;
                console.log('right has enemy')
            }
        }
        var resultsLeft = cc.director.getPhysicsManager().rayCast(p1, p3, cc.RayCastType.Closest);
        for (var i = 0; i < resultsLeft.length; i++) {
            var result = resultsLeft[i];
            var collider = result.collider;
            var point = result.point;
            var normal = result.normal;
            var fraction = result.fraction;
            if (collider.node.group === 'enemy') {
                this.haveLeftEnemy = point.x - p1.x;
                console.log('left has enemy')
            }
        }
    },
    rightButtonHandler() {
        if (Config.gameStop) return;
        if (this.attackCoolDown > 0) return;
        this.attackCoolDown = .3;
        //---right button click
        this.faceRight = 1;
        this.sprite.scaleX = this.faceRight;
        this.checkEnemyPosition();
        let minDistance = 52;
        let maxMoveDistance = 400;
        let actions = [];
        if (this.haveRightEnemy) {
            //--- there are enemys in right
            //--- face right
            if (this.haveRightEnemy < maxMoveDistance) {
                actions.push(cc.moveBy(0.03, this.haveRightEnemy - minDistance, 0));
            } else {
                actions.push(cc.moveBy(0.03, maxMoveDistance - minDistance, 0));
            }
            actions.push(cc.callFunc(function () {
                this.attack();
            }, this))
        } else {
            if (this.haveLeftEnemy) {
                //--- there are enemys in left
                actions.push(cc.moveBy(0.03, 3 * minDistance, 0));
                //--- face left
                actions.push(cc.callFunc(function () {
                    this.dodge();
                }, this))
            } else {
                //--- there are no enemys 
                //--- face right

                actions.push(cc.moveBy(0.03, minDistance, 0));
                actions.push(cc.callFunc(function () {
                    this.attack();
                    // console.log('left no en')
                }, this))
            }
        }
        this.node.runAction(cc.sequence(actions))

    },
    leftButtonHandler() {
        if (Config.gameStop) return;
        if (this.attackCoolDown > 0) return;

        this.attackCoolDown = .3;

        this.faceRight = -1;
        this.sprite.scaleX = this.faceRight;

        this.checkEnemyPosition();
        let minDistance = 52;
        let maxMoveDistance = 400;
        let actions = [];
        if (this.haveLeftEnemy) {
            //--- there are enemys in right
            //--- face right
            if (this.haveLeftEnemy > - maxMoveDistance) {
                actions.push(cc.moveBy(0.03, this.haveLeftEnemy + minDistance, 0));
            } else {
                actions.push(cc.moveBy(0.03, -maxMoveDistance + minDistance, 0));
            }
            actions.push(cc.callFunc(function () {
                this.attack();
            }, this))
        } else {
            if (this.haveRightEnemy) {
                //--- there are enemys in left
                actions.push(cc.moveBy(0.03, -3 * minDistance, 0));
                //--- face left

                actions.push(cc.callFunc(function () {
                    this.dodge();
                }, this))

            } else {
                //--- there are no enemys 
                actions.push(cc.moveBy(0.03, - minDistance, 0));
                actions.push(cc.callFunc(function () {
                    this.attack();
                    // console.log('right no en')

                }, this))
            }
        }
        this.node.runAction(cc.sequence(actions))
    },
    die() {
        //----
        if (this.reviveTime > 0) {
            this.reviveTime--;
            let comp = this.node.getComponent('combatModule');
            comp.revive(50);
            return;
        }
        this.spine.setAnimation(0, 'siwang', false);
        Config.GP.gameOver();
        // console.log('game Over')
    },
    //--------------------被动技能-------------------------
    //--- 吸血
    setLifeStealSmall() {
        this.passiveLifeSteal += 15;
    },
    setLifeStealMiddle() {
        this.passiveLifeSteal += 20;
    },
    setLifeStealLarge() {
        this.passiveLifeSteal += 35;
    },
    //--- 血量增加
    maxHPRiseSmall() {
        let comp = this.node.getComponent('combatModule');
        comp.maxHPrise(20);
    },
    maxHPRiseMiddle() {
        let comp = this.node.getComponent('combatModule');
        comp.maxHPrise(30);
    },
    maxHPRiseLarge() {
        let comp = this.node.getComponent('combatModule');
        comp.maxHPrise(40);
    },
    //--- 护盾增加
    getShieldSmall() {
        let comp = this.node.getComponent('combatModule');
        comp.getShield(10);
    },
    getShieldMiddle() {
        let comp = this.node.getComponent('combatModule');
        comp.getShield(15);
    },
    getShieldLarge() {
        let comp = this.node.getComponent('combatModule');
        comp.getShield(20);
    },


    setInvincible() {
        let comp = this.node.getComponent('combatModule');
        comp.invincible = true;
        this.node.runAction(cc.sequence(
            cc.delayTime(3),
            cc.callFunc(function () {
                comp.invincible = false;
            })
        ))
    },
    update(dt) {
        let dlta = this.node.x - this.camera.x;
        this.camera.x += dlta / 13;
        // this.camera.x = this.node.x
        // this.camera.y = this.node.y

        if (this.node.x > this.bg.x + this.bg.width / 2) {
            let temp = this.bgl;
            this.bgl = this.bg;
            this.bg = this.bgr;
            this.bgr = temp;
            this.bgr.x += this.bg.width * 3;
        }
        if (this.node.x < this.bg.x - this.bg.width / 2) {
            let temp = this.bgr;
            this.bgr = this.bg;
            this.bg = this.bgl;
            this.bgl = temp;
            this.bgl.x -= this.bg.width * 3;
        }

        if (this.node.x > this.fg.x + this.fg.width / 2) {
            let temp = this.fgl;
            this.fgl = this.fg;
            this.fg = this.fgr;
            this.fgr = temp;
            this.fgr.x += this.fg.width * 3;
        }
        if (this.node.x < this.fg.x - this.fg.width / 2) {
            let temp = this.fgr;
            this.fgr = this.fg;
            this.fg = this.fgl;
            this.fgl = temp;
            this.fgl.x -= this.fg.width * 3;
        }

        if (this._surroundWaves) this._setSurroundWaves()

        this.attackCoolDown -= dt;
        if (this.attackCoolDown < 0) this.attackCoolDown = 0;

        this._longScreenSkillCooldown -= dt;
        if (this._longScreenSkillCooldown < 0) this._longScreenSkillCooldown = 0;

        this._concentrateAttackSkillCooldown -= dt;
        if (this._concentrateAttackSkillCooldown < 0) this._concentrateAttackSkillCooldown = 0;

        this._surroundWavesCooldown -= dt;
        if (this._surroundWavesCooldown < 0) this._surroundWavesCooldown = 0;



    },


    _setLongScreenSkill() {
        if (this._longScreenSkillCooldown <= 0) {
            let comp = this.node.getComponent('combatModule');
            this.node.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        comp._setLongScreenSkill(this.longScreenSkillPrefab, this.node.position)
                        //--- animation
                    }, this),
                    cc.delayTime(0.7),
                    cc.callFunc(function () {
                        comp._setLongScreenSkill(this.longScreenSkillPrefab, this.node.position)
                        //--- animation
                    }, this),
                    cc.delayTime(0.7),
                    cc.callFunc(function () {
                        comp._setLongScreenSkill(this.longScreenSkillPrefab, this.node.position)
                        //--- animation
                    }, this),
                    cc.delayTime(0.7),
                )
            )
            this._longScreenSkillCooldown = 25;
        }
    },
    getLongScreenAbility() {
        this._longScreenSkill = true;
    },
    dropLongScreenAbility() {
        this._longScreenSkill = false;
    },
    _setConcentrateAttackSkill() {
        if (this._concentrateAttackSkillCooldown <= 0) {
            let comp = this.node.getComponent('combatModule');
            let x = this.node.x + this.faceRight * 100;

            let ass = [];
            for (let i = 0; i < 15; i++) {
                this.checkEnemyPosition();
                let position = cc.v2(x + 200 * Math.random() - 100, this.node.y);

                ass.push(
                    cc.callFunc(function () {
                        comp._setConcentrateAttackSkill(this.concentrateAttackSkillPrefab, position)
                        //--- animation
                    }, this));
                ass.push(cc.delayTime(0.1));
            }
            this.node.runAction(
                cc.sequence(ass)
            )
            this._concentrateAttackSkillCooldown = 15;
        }
    },
    getConcentrateAttackAbility() {
        this._concentrateAttackSkill = true;
    },
    dropConcentrateAttackAbility() {
        this._concentrateAttackSkill = false;
    },
    _setSurroundWaves() {
        if (this._surroundWavesCooldown <= 0) {
            let comp = this.node.getComponent('combatModule');
            comp._surroundWavesCooldown(this.surroundWavesPrefab, this.node.position);
            this._surroundWavesCooldown = 0.3;
        }
    },
    getSurroundWavesAbility() {
        this._surroundWaves = true;
        this.node.getChildByName('surround').active=true;
    },
    dropSurroundWavesAbility() {
        this._surroundWaves = false;
        this.node.getChildByName('surround').active=false;
    },

    getBleedAbility() {
        this._bleedAbility = true;
    },
    dropBleedAbility() {
        this._bleedAbility = false;
    },

    getPoisonAbility() {
        this._poisonAbility = true;
    },
    dropPoisonAbility() {
        this._poisonAbility = false;
    },
    getLongWaveAbility(){
     this._longWaveAbility=true;
    },
    dropLongWaveAbility(){
        this._longWaveAbility=false;
    },
    setLongWave(ignoreNode) {
        this._setWave(this.faceRight,this.longWavePrefab,ignoreNode)
     },

     getShortWaveAbility(){
        this._shortWaveAbility=true;
     },
     dropShortWaveAbility(){
        this._shortWaveAbility=false;
     },
    setShortWave(ignoreNode) {
        this._setWave(this.faceRight,this.shortWavePrefab,ignoreNode)
        console.log('short wav')
     },

     getBacktWaveAbility(){
        this._backWaveAbility=true;
     },
     dropBacktWaveAbility(){
        this._backWaveAbility=false;
     },
    setBackWave() {
        this._setWave(-this.faceRight,this.shortWavePrefab,null)
     },

    attack0() {
        this.spine.setAnimation(0, 'a', false);
        this.spine.addAnimation(0, 'daiji', true, 0);
    },
    attack1() {
        this.spine.setAnimation(0, 'b', false);
        this.spine.addAnimation(0, 'daiji', true, 0);

    },
    attack2() {
        this.spine.setAnimation(0, 'c', false);
        this.spine.addAnimation(0, 'daiji', true, 0);
    },
    attack3() {
        this.spine.setAnimation(0, 'd', false);
        this.spine.addAnimation(0, 'daiji', true, 0);
    },
    wait() {
        this.spine.setAnimation(0, 'daiji', true);
    },


    _setWave(faceRight, prefab,ignoreNode) {
        let comp = this.node.getComponent('combatModule');
        comp.setWave(faceRight, prefab,ignoreNode);
    },

    _setMix(anim1, anim2) {
        this.spine.setMix(anim1, anim2, this.mixTime);
        this.spine.setMix(anim2, anim1, this.mixTime);
    }
});
