const enemyType = cc.Enum({
    base: 0,
    dash: 1,
    dash2: 2,
    dash3: 3,
    bomb: 4,
});
var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        faceRight: 1,
        //--- 攻击间隔
        attackCoolDown: 2,

        _attackCoolDownCounter: 0,
        //--- 感知范围
        attackRange: 100,
        attackPrefab: cc.Prefab,
        //--- 移动速度
        moveSpeed: 20,
        multiBaseHP: 50,
        multiBaseDamage: 10,

        type: {
            type: enemyType,
            default: enemyType.dash2,
        },
        alive: true,
        mixTime:.3,
    },


    onLoad() {
        this.sprite = this.node.getChildByName('sprite');
        this.spine = this.sprite.getChildByName('spine').getComponent('sp.Skeleton');
        this._setMix('xingzou', 'daiji')
        this._setMix('daiji', 'xingzou')
        this._setMix('xingzou', 'gongji')
        this._setMix('gongji', 'xingzou')
        this._setMix('daiji', 'gongji')
        this._setMix('gongji', 'daiji')
    },

    start() {

        let BaseData = {
            isEnemy: true,
            baseHP: Config.HPDATA[Config.difficultLevel] * this.multiBaseHP,
            baseDamage: Config.HPDATA[Config.difficultLevel + 1] * this.multiBaseDamage,
        }
        this.node.getComponent('combatModule').init(BaseData, this);
        this._moveabled = true;
    },
    move() {
        if (!this._moveabled) return;
        let p1 = this.node.parent.convertToWorldSpaceAR(this.node.position)
        let p2 = p1.add(cc.v2(this.faceRight * (this.moveSpeed + this.node.width / 2), 0));
        var resultsRight = cc.director.getPhysicsManager().rayCast(p1, p2, cc.RayCastType.Any);
        for (var i = 0; i < resultsRight.length; i++) {
            var result = resultsRight[i];
            var collider = result.collider;
            var point = result.point;
            var normal = result.normal;
            var fraction = result.fraction;
            if (collider.node.group === 'enemy') {
                this.playDaiji();
                return;
            }
        }


        this.playWalking();

        this.node.x += this.faceRight * this.moveSpeed;
        this.sprite.scaleX = this.faceRight;
        //---  ray 
        //--- 玩家，攻击
        //--- 敌人，待命
    },
    attack() {
        this.playAttack();
        if (this.type === enemyType.base) {
            this.punch();
        }

        if (this.type === enemyType.dash) {
            this.dash1();
        }

        if (this.type === enemyType.dash2) {
            this.dash2();
        }
        if (this.type === enemyType.dash3) {
            this.dash3();
        }

    },
    punch() {
        //shot wave
        let comp = this.node.getComponent('combatModule');
        comp.attack(this.faceRight, this.attackPrefab, () => {
            return;
        })
    },
    dash() {
        //shot wave
        this._moveabled = false;
        let comp = this.node.getComponent('combatModule');
        comp.attack(this.faceRight, this.attackPrefab, () => {
            return;
        })
        this.node.runAction(
            cc.moveBy(.5, cc.v2(this.faceRight * 20, 0)),
        )
    },
    dash1() {
        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this._moveabled = true;
            }),
        ))
    },
    dash2() {

        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this._moveabled = true;
            }),
        ))
    },
    dash3() {

        this.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.dash();
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this._moveabled = true;
            }),
        ))
    },
    checkDistance() {
        let deltaX = Config.GP.player.x - this.node.x;
        let distance = Math.abs(deltaX);
        let isPlayerAtRight = distance / deltaX;
        this.faceRight = isPlayerAtRight;
        return distance;
    },
    die() {
        //----
        Config.GP.waveEnemyNumbers--;
        if (this.type === enemyType.bomb) {
            //---- generate bomb
            //---- set bomb 
        }
        this.node.removeComponent(cc.RigidBody);
        this.alive = false;
        this.spine.setAnimation(0, 'siwang', false);
        this.node.getChildByName('MaxHPBar').active = false;
        Config.GP.checkWaveComplete();

        this.node.runAction(cc.sequence(
            cc.delayTime(1),
            cc.fadeOut(.2),
            cc.callFunc(() => {
                this.node.destroy();
            })
        ))

    },
    update(dt) {
        if (Config.gameStop) return;
        if (!this.alive) return;
        let distance = this.checkDistance();
        this._attackCoolDownCounter += dt;
        if (this._attackCoolDownCounter > 9999) this._attackCoolDownCounter = 9999;

        if (distance > this.attackRange) {
            this.move();
        } else {
            if (this._attackCoolDownCounter > this.attackCoolDown) {
                this.attack();
                this._attackCoolDownCounter = 0;
            }else{
                this.playDaiji();
            }
        }
    },
    playWalking() {
        var oldAnim = this.spine.animation;
        if (oldAnim === 'xingzou') return;
        this.spine.setAnimation(0, 'xingzou', true);
    },
    playAttack() {
        this.spine.setAnimation(0, 'gongji', false);
        this.spine.addAnimation(0, 'daiji', true, 0);
    },

    playDaiji() {
        var oldAnim = this.spine.animation;
        if (oldAnim === 'gongji') return;
        if (oldAnim === 'daiji') return;
        this.spine.setAnimation(0, 'daiji', true);
    },
    _setMix(anim1, anim2) {
        this.spine.setMix(anim1, anim2, this.mixTime);
        this.spine.setMix(anim2, anim1, this.mixTime);
    }
});
