var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        wave: cc.Prefab,
    },
    // onLoad () {},
    start() {
        //--- animation
        //--- shoots
        let wave = cc.instantiate(this.wave);
        let comp = wave.getComponent('baseAttack');
        comp.dataOnlyInit(this.realDamage, this.additionDamage, this.isCritical, this.callback);
        wave.parent = this.node;
        wave.position = cc.v2(-800, 0);
        wave.runAction(
            cc.sequence(
                cc.moveBy(.2, 1600, 0),
                cc.delayTime(.4),
                cc.callFunc(function () {
                    this.node.destroy();
                }, this)
            )
        )
    },
    init(realDamage, additionDamage, isCritical, callback) {
        this.realDamage = realDamage;
        this.additionDamage = additionDamage;
        this.isCritical = isCritical;
        this.callback = callback;

    },
});
