a = {
    init: function (es, fs) {

        for (let i = 0; i < es.length; i++) {
            es[i].on("floor_button_pressed", function (n) {

                es[i].goToFloor(n);
            });

            es[i].on('passing_floor', function (n, dir) {
                let index = es[i].destinationQueue.indexOf(n);
                if (index >= 0)



                es[i].goToFloor(n, true)




            })

            es[i].on('stopped_at_floor', function (n) {
            })

        }


        for (let i = 0; i < fs.length; i++) {
            fs[i].on("up_button_pressed", function (f) {
                let n = f.floorNum();
                for (let j = 0; j < es.length; j++) {
                    if (es[j].destinationQueue.length === 0) {
                        es[j].goToFloor(n);
                        return;
                    }
                }

                //---
            });

            fs[i].on("down_button_pressed", function (f) {
                let n = f.floorNum();
                for (let j = 0; j < es.length; j++) {
                    if (es[j].destinationQueue.length === 0) {
                        es[j].goToFloor(n);
                        return;
                    }
                }
            });
        }



    },

    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}