const enemyType = cc.Enum({
    Default: 0,
    Gray: 1,

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
        skyArrowPrefab: cc.Prefab,
        staticSkyArrowPrefab: cc.Prefab,
        //--- 移动速度
        moveSpeed: 40,
        multiBaseHP: 50,
        multiBaseDamage: 20,

        senior: false,
        alive: true,
        combo:false,
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
        this.node.getComponent('combatModule').init(BaseData, this)

    },
    move() {
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
        let position = Config.GP.player.position;
        this.playAttack();
        if (this.senior) {
            this.node.getComponent('combatModule').looseArrow(this.staticSkyArrowPrefab, position.add(cc.v2(220, 0)));
            this.node.getComponent('combatModule').looseArrow(this.skyArrowPrefab, position.add(cc.v2(-220, 0)));
            this.node.getComponent('combatModule').looseArrow(this.staticSkyArrowPrefab, position);

        } else {

            this.node.getComponent('combatModule').looseArrow(this.skyArrowPrefab, position);
        }

        if (this.combo) {

            this.node.runAction(cc.sequence(
                cc.delayTime(.5),
                cc.callFunc(function () {
                    this.playAttack();
                    if (this.senior) {
                        this.node.getComponent('combatModule').looseArrow(this.staticSkyArrowPrefab, position.add(cc.v2(220, 0)));
                        this.node.getComponent('combatModule').looseArrow(this.skyArrowPrefab, position.add(cc.v2(-220, 0)));
                        this.node.getComponent('combatModule').looseArrow(this.staticSkyArrowPrefab, position);

                    } else {

                        this.node.getComponent('combatModule').looseArrow(this.skyArrowPrefab, position);
                    }
                }, this)
            ))
        }

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
            } else {
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
        if (oldAnim === 'daiji') return;
        if (oldAnim === 'gongji') return;
        console.log(oldAnim,'old')
        this.spine.setAnimation(0, 'daiji', true);
    },
    _setMix(anim1, anim2) {
        this.spine.setMix(anim1, anim2, this.mixTime);
        this.spine.setMix(anim2, anim1, this.mixTime);
    }
});
