var Config=require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        trough:0,
        canoo:999,
        isCritical: false,
        damage: 0,
        additionDamage: 0,

        callback: null,
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onBeginContact(contact, self, other) {
        if(this.ignoreNode===other.node){
            contact.disabled=true;
            return;
        }
        this.trough++;
       
        let comp = other.node.getComponent('combatModule');
        comp.attacked(this.damage, this.additionDamage, this.isCritical)
        if (this.callback) {
            this.callback(comp);
        }
        contact.disabled=true;


        if(this.trough>=this.canoo){
            this.node.destroy();
        }
    },

 
    dataOnlyInit(damage,additionDamage,isCritical,callback){
        if(callback)this.callback=callback;
        this.damage=damage;
        this.additionDamage=additionDamage;
        this.isCritical=isCritical;
    },
    // update (dt) {},
});
