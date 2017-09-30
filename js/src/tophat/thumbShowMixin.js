var thumbShowMixin = {

    methods: {

        /**
         * @des set mark to index of thumb
         */
        thumbMarkSet: function (){

            //if (this.thumb.mark === this.thumb.showed) {
            //    this.$set(this.thumb, 'mark', false);
            //}
            //else {
                this.$set(this.thumb, 'mark', this.thumb.showed);
            //}
        },

        /**
         * @des jump to thumb marked index
         */
        thumbMarkJumpTo: function () {

            if (false === this.thumb.mark) {
                return;
            }
            this.$set(this.thumb, 'showed', this.thumb.mark);

            var thumb = this.getThumbById(this.thumb.mark);

            if (!thumb) {
                return;
            }

            this.thumbJumpToIdFrameSet(thumb.id);

            this.thumbSelectById(thumb.id);

            this.sceneSet(thumb);

            this.console(thumb.name);
            this.size(thumb);
        },

        /**
         * @des set thumb frame, scene, [cache] showed
         * @param row
         */

        thumbGoShow: function (act) {

            var showedIndex = this.thumb.showed;
            var idNext;
            var idFirstFrame;
            var inFrame;
            var act = act || 'end';
            var row;

            if (['home', 'end', 'prev', 'next', 'prevRow', 'nextRow'].indexOf(act) == -1) {
                return false;
            }

            idNext = this.thumbGetIndex(showedIndex, act);

            if (idNext === false) {
                return;
            }

            var thumb = this.thumb.cache.dir[idNext];

            if (!thumb) {
                return;
            }

            inFrame = this.thumbInFrame(idNext);

            if (!inFrame) {

                row = act;
                if (act == 'prevRow') {
                    row = 'prev';
                }
                if (act == 'nextRow') {
                    row = 'next';
                }

                idFirstFrame = this.thumbGetFirstIdInFrame(row);

                this.thumbFrameSet(idFirstFrame);
            }

            this.$set(this.thumb, 'showed', thumb.id);

            this.sceneSet(thumb);

            this.console(thumb.name);
            this.size(thumb);
        },

    }
};