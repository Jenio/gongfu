var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed: 2,
        readyCountDown: 2,
        _ready: false,
        shootCountDown: 1,
        arrow: cc.Prefab,
        static:false,
    },
    // onLoad () {},
   
    init(realDamage, additionDamage, isCritical, callback) {
        this.realDamage = realDamage;
        this.additionDamage = additionDamage;
        this.isCritical = isCritical;
        this.callback = callback;

    },
    checkDistance() {
        let deltaX = Config.GP.player.x - this.node.x;
        let distance = Math.abs(deltaX);
        let isPlayerAtRight = distance / deltaX;
        this.faceRight = isPlayerAtRight;
        return distance;
    },
    update(dt) {
        if (Config.gameStop) {
            this.node.destroy();
            return;
        };

        
        let deltaX = Config.GP.player.x - this.node.x;
        if (!this._ready) {
            this.readyCountDown -= dt;
         if(!this.static){
            if (deltaX > 0) this.node.x += 1;
            else this.node.x -= 1;
         }
            if (this.readyCountDown <= 0) {
                this._ready = true;
                //--- _ready to shoot ,show waring 
            };
        } else {

            this.shootCountDown -= dt;
            if (this.shootCountDown <= 0) {
                //--- shoots
                this.shootCountDown += 999;
                let arrow = cc.instantiate(this.arrow);
                this.node.runAction(cc.sequence(
                    cc.delayTime(.3),
                    cc.callFunc(function(){
                        this.node.destroy();
                    },this)
                ))
                let comp = arrow.getComponent('baseAttack');
                comp.arrowFallInit( this.realDamage, this.additionDamage, this.isCritical, this.callback);
                arrow.parent = this.node.parent;
                arrow.x=this.node.x;
                arrow.y = this.node.y+1161;
       

            }
        }
    },
    // update (dt) {},
});
