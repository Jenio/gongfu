var Config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        
        gameScene: cc.Node,
        questScene: cc.Node,
        skillScene: cc.Node,
        missionScene: cc.Node,
        equipmenpScene: cc.Node,

        gameOverPanelPrefab: cc.Prefab,
        gamePausePanelPrefab: cc.Prefab,
        levelUpModalPrefab:cc.Prefab,
        header:cc.Node,
        menubar: cc.Node,
        modals:[cc.Node],
        activeModal:null,


        missionCompleteModalPrefab:cc.Prefab,

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.init();
        // cc.director.getPhysicsManager().debugDrawFlags=true;
    },
    init() {
        this.menubar.x = 0;
        this.menubar.y = -cc.winSize.height / 2;
    },
    showMenuScene() {
        this.closeAllScene();
        this.menuScene.active = true;
    },
    showGameScene() {
        this.closeAllScene();
        this.gameScene.active = true;
    },
    showGameOverPanel() {
        let gameover = cc.instantiate(this.gameOverPanelPrefab);
        gameover.parent = this.node;
        gameover.getChildByName('close').on('touchend', function () {
            gameover.destroy();
        }, this)
    },
    showGamePausePanel() {
        let gamePause = cc.instantiate(this.gamePausePanelPrefab);
        gamePause.parent = this.node;
        gamePause.getChildByName('close').on('touchend', function () {
            gamePause.destroy();
        }, this)
    },
    closeAllScene() {
        this.gameScene.active = false;
        this.questScene.active = false;
        this.skillScene.active = false;
        this.missionScene.active = false;
        this.equipmenpScene.active = false;

        this.menubar.active = false;

        if(this.activeModal)this.activeModal.destroy();
        for(let i =0;i<this.modals.length;i++){
            this.modals[i].destroy();
        }
        this.modals=[];
    },
    menuBarResetItemPosition() {
        //--- 底部选项卡按钮 ，点击特效
        let activeNumber = this.activeNumber;
        let width = 100;
        let activeScale = 1.3;
        let changeSize = (activeScale - 1) * width;
        let interval = 44;
        let startPosition = cc.v2(-355, 12);
        for (let i = 0; i < this.menubar.children.length; i++) {
            let item = this.menubar.children[i];
            if (i === activeNumber) {
                item.runAction(cc.scaleTo(.5, activeScale).easing(cc.easeSineInOut()));
            }
            else {
                item.runAction(cc.scaleTo(.5, 1).easing(cc.easeSineInOut()));
            }
            let scaleDelta = 0
            if (i > activeNumber) {
                scaleDelta = changeSize;
            } else {
                scaleDelta = 0;
            }
            let x = (width + interval) * i + scaleDelta;
            item.runAction(
                cc.moveTo(.5, startPosition.add(cc.v2(x, 0))).easing(cc.easeSineInOut()),
            )
        }
    },
    showQuestScene() {
        this.activeNumber = 0;
        this.menuBarResetItemPosition();
        this.closeAllScene();
        this.questScene.active=true;
        this.menubar.active=true;
    },
    showSkillScene() {
        this.activeNumber = 1;
        this.menuBarResetItemPosition();
        this.closeAllScene();
        this.skillScene.active=true;
        this.menubar.active=true;
    },
    showMissionScene() {
        this.activeNumber = 2;
        this.menuBarResetItemPosition();
        this.closeAllScene();
        this.missionScene.active=true;
        this.menubar.active=true;
    },
    showEquipmentScene() {
        this.activeNumber = 3;
        this.menuBarResetItemPosition();
        this.closeAllScene();
        this.equipmenpScene.active=true;
        this.menubar.active=true;
    },
    show4() {
        this.activeNumber = 4;
        this.menuBarResetItemPosition();
    },
    // update (dt) {},


    shwoLevelUpModal(data){
       let levelUp=cc.instantiate(this.levelUpModalPrefab);
       levelUp.parent=this.node;
        this.activeModal=levelUp;

       let scrollViewNode=levelUp.getChildByName('scrollView');
       let view=scrollViewNode.getChildByName('view');
       let content=view.getChildByName('content');
       for(let i = 0;i<content.children.length;i++){
           let item = content.children[i];
           let img=data[i].img;
           let callback=data[i].callback;
           let desc=data[i].desc;

           item.getChildByName('sprite').getComponent(cc.Sprite).spriteFrame=img;
           item.getChildByName('desc').getComponent(cc.Label).string=desc;


           item.on('touchend',function(){
            callback();
            this.activeModal=null;
            levelUp.destroy();

           },this)
       }
    }
});
