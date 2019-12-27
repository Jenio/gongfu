var Config=require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        isCritical: false,
        damage: 0,
        additionDamage: 0,

        callback: null,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onBeginContact(contact, self, other) {
        let comp = other.node.getComponent('combatModule');
        comp.attacked(this.damage, this.additionDamage, this.isCritical)
        if (this.callback) {
            this.callback(comp);
        }
        contact.disabled=true;
        this.node.destroy();
    },
 
    baseAttackInit(faceRight,damage,additionDamage,isCritical,attackLength) {
        this.damage=damage;
        this.additionDamage=additionDamage;
        this.isCritical=isCritical;
        // console.log('run action ',faceRight)
        // console.log(this.node)
        this.node.runAction(
            cc.sequence(
                cc.moveBy(.1, faceRight*attackLength, 1),
                cc.callFunc(function () {
                    this.node.destroy();
                }, this)
            )
        )
    },
    arrowFallInit(damage,additionDamage,isCritical,callback){
        if(callback)this.callback=callback;
        this.damage=damage;
        this.additionDamage=additionDamage;
        this.isCritical=isCritical;
        this.node.runAction(cc.sequence(
            cc.moveBy(.3, 0, -1161),
            cc.delayTime(.1),
            cc.callFunc(function () {
                this.node.destroy();
            }, this)
        ))
    },
    dataOnlyInit(damage,additionDamage,isCritical,callback){
        if(callback)this.callback=callback;
        this.damage=damage;
        this.additionDamage=additionDamage;
        this.isCritical=isCritical;
    },
    // update (dt) {},
});
