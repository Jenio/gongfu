var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        controller: null,
        isEnemy: true,
        EXP: 4,
        alive: true,

        beforeAttackDelay: 1,
        //---- Combat  
        //--- 血量
        baseHP: 2000,
        MaxHP: 2000,
        HP: 2000,
        //--- 基础攻击力
        baseDamage: 1000,
        realDamage: 1000,
        //--- 附加伤害（无视）
        additionDamage: 30,
        //--- 伤害减少
        defence: 0,
        //--- 护盾
        shield: 200,
        //--- 暴击率
        criticalRate: 0,
        //--- 闪避率
        evade: 0,
        //--- 无敌
        invincible: false,
        //--- 格挡伤害次数
        blockDamage: 3,

        //--- views
        maxHPBar: cc.Node,
        //--- 加成:1:10%
        damageRise: 0,
        HPRise: 0,


        attackLength: 120,


        //---player passive
        _strong: false,
        _weakPower: false,
        _comboMaster: false,

        _bleedDamage: 20,
        _bleedTimes: 0,
        _bleedCooldown: 0,

        _poisonDamage: 22,
        _poisonTime: 0,
        _poisonCooldown: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init(data, controller) {
        this.controller = controller;
        this.isEnemy = data.isEnemy;
        this.baseHP = data.baseHP ? data.baseHP : 1;
        this.MaxHP = data.baseHP ? data.baseHP : 1;
        this.HP = data.baseHP ? data.baseHP : 0;
        this.baseDamage = data.baseDamage ? data.baseDamage : 0;
        this.realDamage = data.baseDamage ? data.baseDamage : 0;
        this.additionDamage = data.additionDamage ? data.additionDamage : 0;
        this.defence = data.defence ? data.defence : 0;
        this.shield = data.shield ? data.shield : 0;
        this.criticalRate = data.criticalRate ? data.criticalRate : 0;
        this.evade = data.evade ? data.evade : 0;
        this.invincible = data.invincible ? data.invincible : 0;
        this.blockDamage = data.blockDamage ? data.blockDamage : 0;

        this.attackFrontDelay = data.attackFrontDelay ? data.attackFrontDelay : 0;

        this.HPBarRefresh();

        this._strong = false;


    },

    start() {

    },
    attack(faceRight, prefab, callback) {
        this.node.runAction(cc.sequence(
            cc.delayTime(this.beforeAttackDelay),
            cc.callFunc(() => {
                let attackNode = cc.instantiate(prefab);
                attackNode.parent = this.node.parent;
                attackNode.position = this.node.position;
                let isCritical;
                if (Math.random() < this.criticalRate) {
                    isCritical = true;
                } else {
                    isCritical = false;
                }
                let realDamage = this.realDamage;
                if (this._strong) {
                    if (this.HP === this.maxHP) {
                        realDamage += this.baseDamage * 0.5;
                    }
                }
                if (this._weakPower) {
                    let add = Math.floor((this.MaxHP - this.HP) * 10 / this.maxHP)
                    realDamage += this.baseDamage * add;
                }

                realDamage = isCritical ? 2 * this.realDamage : this.realDamage
                attackNode.getComponent('baseAttack').baseAttackInit(faceRight, realDamage, this.additionDamage, isCritical, this.attackLength);
                if (callback) {
                    attackNode.getComponent('baseAttack').callback = callback;
                }

            })
        ))


    },

    looseArrow(prefab, position, callback) {

        let skyArrow = cc.instantiate(prefab);
        skyArrow.parent = this.node.parent;
        skyArrow.position = position;
        let isCritical;
        if (Math.random() < this.criticalRate) {
            isCritical = true;
        } else {
            isCritical = false;
        }
        let realDamage = isCritical ? 2 * this.realDamage : this.realDamage;
        skyArrow.getComponent('skyArrow').init(realDamage, this.additionDamage, isCritical, callback);

    },
    attacked(n, additionDamage, isCritical) {
        n=parseInt(n);
        additionDamage=parseInt(additionDamage);
        //--- wudi
        if (this.invincible) return;
        if (this.blockDamage > 0) {
            //--- block
            this.blockDamage--;
            return;
        }
        let evadeRandom = Math.random();
        if (evadeRandom < this.evade) {
            //--- doge
            return;
        }
        let hurtValue = n - this.defence;
        if (hurtValue < 0) hurtValue = 0;
        //--- attack
        if (this.shield > 0) {
            if (this.shield > hurtValue) {
                //--- hit shield
                this.shield -= hurtValue;
                this.hurt(0, isCritical);
            } else {
                //--- hit shield and HP

                this.hurt(hurtValue - this.shield, isCritical);
                this.shield = 0;
            }
        } else {
            this.hurt(hurtValue, isCritical);
        }
        //--- addition
        if (additionDamage > 0) {
            this.additionHurt(additionDamage);
        }
        //--- show HP
        this.HPBarRefresh();
    },
    HPBarRefresh() {
        let HPProgress = 0;
        let shieldProgress = 0;
        let life = this.shield + this.HP
        if (life > this.MaxHP) {
            HPProgress = this.HP / life;
            shieldProgress = life / life;
        } else {
            HPProgress = this.HP / this.MaxHP;
            shieldProgress = life / this.MaxHP;
        }
        let HPBar = this.maxHPBar.getChildByName('HPBar');
        let HPLabel = this.maxHPBar.getChildByName('HPLabel').getComponent(cc.Label);
        let shieldBar = this.maxHPBar.getChildByName('shieldBar');

        HPLabel.string = this.labelFormat(this.HP);
        if (this.shield) HPLabel.string += '(' + this.labelFormat(this.shield) + ')';
        HPBar.getComponent(cc.Sprite).fillRange = HPProgress;
        shieldBar.getComponent(cc.Sprite).fillRange = shieldProgress;
        ///---- HPBar render;
    },
    hurt(n, isCritical) {
        if (!this.alive) return;
        this.HP -= n;
        let position = this.node.position.add(this.maxHPBar.position).add(cc.v2(0, 40));
        if (n) {
            Config.GP.showHurtLabel(n, cc.Color.RED, position, isCritical);
        }
        if (this.HP <= 0) {
            this.HP = 0;
            this.die();
        }
        this.HPBarRefresh();
    },
    bleed() {
        if (!this.alive) return;
        if (this._bleedTimes <= 0) return;
        this._bleedTimes--;
        this._bleedCooldown = 0.3;

        let damage = this._bleedDamage;
        this.HP -= damage;
        let position = this.node.position.add(this.maxHPBar.position).add(cc.v2(20, 30));
        if (damage) {
            Config.GP.showHurtLabel(damage, cc.Color.RED, position, false);
        }
        if (this.HP <= 0) {
            this.HP = 0;
            this.die();
        }
        this.HPBarRefresh();
    },
    poisoned() {
        if (!this.alive) return;
        if (this._poisonTime <= 0) return;
        this._poisonTime--;
        this._poisonCooldown = 0.3;
        let damage = this._poisonDamage;
        this.HP -= damage;
        let position = this.node.position.add(this.maxHPBar.position).add(cc.v2(-20, 20));
        if (damage) {
            Config.GP.showHurtLabel(damage, cc.Color.RED, position, false);
        }
        if (this.HP <= 0) {
            this.HP = 0;
            this.die();
        }
        this.HPBarRefresh();
    },
    additionHurt(n) {
        if (!this.alive) return;
        this.HP -= n;
        let position = this.node.position.add(this.maxHPBar.position).add(cc.v2(0, 40));

        if (n) {
            Config.GP.showHurtLabel(n, cc.Color.RED, position.add(cc.v2(30, -30)), false);
        }
        if (this.HP <= 0) {
            this.HP = 0;
            this.die();
        }
        this.HPBarRefresh();
    },
    die() {
        this.alive = false;
        Config.GP.getExperience(this.EXP);
        //--- animation
        this.controller.die();
        //---
    },
    revive(n) {
        this.alive = true;
        this.getHealed(n);
    },

    realDamageRise(n) {
        //---1% of base Damage up

        let num = n * 0.01 * this.baseDamage;
        num = parseInt(num)

        this.realDamage += num;
        this.damageRise += n;
    },
    getShield(n) {
        //---1% of base HP up
        let num = n * 0.01 * this.baseHP;
        num = parseInt(num)
        this.shield += num;
        this.HPBarRefresh();

    },

    getPoison(damage, time) {
        this._poisonDamage = damage;
        this._poisonTime += time;
    },
    getBleed(damage, time) {
        this._bleedDamage = damage;
        this._bleedTimes += time;
    },
    maxHPrise(n) {
        //---1% of base HP up
        let num = n * 0.01 * this.baseHP;
        num = parseInt(num)
        this.maxHP += num;
        this.HPRise += n;
        if (n > 0) {
            this.HP += num;
        } else {
            //---  减少血量上限，HP不可超过MAXHP
            if (this.HP > this.MaxHP) {
                this.HP = this.MaxHP;
            }
        }
        this.HPBarRefresh();
    },
    getHealed(n) {
        //--- 1% Max HP Healed
        if (n <= 0) return;
        let heal = n * 0.01 * this.MaxHP
        heal = parseInt(heal);
        this.HP += heal;
        if (this.HP > this.MaxHP) this.HP = this.MaxHP;
        let position = this.node.position.add(this.maxHPBar.position).add(cc.v2(Math.random() * 10, Math.random() * 10 + 30));
        Config.GP.showHealLabel(heal, cc.Color.GREEN, position);
        this.HPBarRefresh();
    },
    labelFormat(n) {
        let str = '';
        let nagetive = false;
        if (n < 0) {
            nagetive = true;
            n = -n;
        }
        if (n < 10000) {
            n = n;
        } else if (n < 1000000) {
            n = Math.floor(n / 1000) + 'K'
        } else if (n < 1000000) {
            n = Math.floor(n / 1000000) + 'M'
        }
        if (nagetive) {
            n = '-' + n;
        }

        return n;
    },
    update(dt) {
        if(!this.alive)return;
        this._bleedCooldown -= dt;
        if (this._bleedCooldown < 0)
            this.bleed();
        this._poisonCooldown -= dt;
        if (this._poisonCooldown < 0)
            this.poisoned()
    },

    //--- player passive
    _setStrong() {
        this._strong = true;
    },
    _setLongScreenSkill(prefab, position) {

        let skillNode = cc.instantiate(prefab);
        skillNode.parent = this.node.parent;
        skillNode.position = position;

        let realDamage = 2 * this.realDamage;
        skillNode.getComponent('longScreenSkill').init(realDamage, this.additionDamage, false, null);
    },
    _setConcentrateAttackSkill(prefab, position) {
        let skillNode = cc.instantiate(prefab);
        skillNode.parent = this.node.parent;
        skillNode.position = position.add(cc.v2(0, 1160));
        let realDamage = 2 * this.realDamage;
        let comp = skillNode.getComponent('baseAttack');
        comp.dataOnlyInit(realDamage, this.additionDamage, false, () => {
            //--- 只造成一次伤害
            // comp.node.getComponent(cc.RigidBody).enabledContactListener=false;
            comp.node.destroy();
        });

        skillNode.runAction(cc.sequence(
            cc.moveBy(.2, 0, -1160),
            cc.callFunc(function () {

            }, this),
            cc.delayTime(2),
            cc.callFunc(function () {
                skillNode.destroy();
            }, this)
        ));
    },
    _surroundWavesCooldown(prefab, position) {
        let skillNode = cc.instantiate(prefab);
        skillNode.parent = this.node.parent;
        skillNode.position = position.add(cc.v2(0, 100));
        let comp = skillNode.getComponent('baseWave');
        comp.dataOnlyInit(this.realDamage * 0.1, this.additionDamage, false, null);
        skillNode.runAction(cc.sequence(
            cc.moveBy(.1, 0, -100),
            cc.callFunc(() => {
                skillNode.destroy();
            })
        ));
    },

    setWave(faceRight, prefab,ignoreNode) {
        let wave = cc.instantiate(prefab);
        wave.parent = this.node.parent;
        wave.position = this.node.position;
        wave.scaleX = faceRight;


        let comp = wave.getComponent('baseWave');
        comp.dataOnlyInit(this.realDamage * 0.1, this.additionDamage, false, null);
        comp.ignoreNode=ignoreNode;

        wave.runAction(
            cc.sequence(
                cc.moveBy(.6, 1000 * faceRight, 0),
                cc.callFunc(function () {
                    wave.destroy();
                }, this)
            )
        )
    }

});
