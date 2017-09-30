var thumbScrollMixin = {

    methods: {

        /**
         * @des compute height scroll
         */
        thumbScrollInit: function () { ////var integer = (thumbs - thumbs % rows) / rows;

            var hRow = param.thumb.rowHeight; //height of row in thumbnails
            var H; //height of thumb area (all visible + invisible)
            var sH; //height of scroll
            var scrollHeight = this.$root.thumb.scroll.height;

            var thumbs = this.thumb.dir.length;
            var rows = param.thumb.rows;

            var rowsInteger = Math.floor(thumbs/rows);
            var rowsRemainder = thumbs % rows;

            var rowsTotal = rowsInteger;

            if (rowsTotal < 1) {
                rowsTotal = 1;
            }

            if (rowsRemainder > 0) {
                rowsTotal += 1;
            }

            H = rowsTotal * hRow;
            sH = Math.floor(hRow * hRow / H);

            if (sH > scrollHeight) {
                scrollHeight = sH;
            }

            this.thumb.rowsTotal = rowsTotal; //cache count of rows

            this.$root.$set(this.$root.thumb.scroll, 'height', scrollHeight);
            this.$root.$set(this.$root.thumb.scroll, 'top', 2);
        },

        thumbScrollMouseMove: function (offset) {

            //var count = Math.floor(param.thumb.inRow * param.thumb.rows);
            var count = Math.floor(param.thumb.inRow * param.thumb.rows);

            if (this.thumb.dir.length < count) {
                return;
            }

            var scrollTop = this.$root.thumb.scroll.top + offset.top;

            if (scrollTop < this.$root.thumb.scroll.topInit) {
                return;
            }
            else if ((scrollTop + this.$root.thumb.scroll.height + this.$root.thumb.scroll.bottom) > this.thumb.thumbnails.height) {
                return;
            }

            this.$set(this.thumb.scroll, 'top', scrollTop);
            this.$set(this.thumb.scroll, 'active', true);

            var heightScrollOffsetRow = this.thumb.scroll.heightScrollOffsetRow;
            var rowsOffset = Math.floor(scrollTop / heightScrollOffsetRow); //count of moved rows;

            if (rowsOffset > this.thumb.rowsTotal) {
                rowsOffset = this.thumb.rowsTotal - 1;
            }

            var indexOfStartThumbInFrame = Math.floor(rowsOffset * param.thumb.inRow);

            var item = this.thumb.dir[indexOfStartThumbInFrame];

            if (item) {

                //this.thumbFrameSet(item.id);

                var arrVisible = [];
                var flag = false;
                var c = count;

                for (var i=0; i < this.thumb.dir.length; i++){

                    if (item.id == this.thumb.dir[i].id) {

                        flag = true;
                        arrVisible.push(this.thumb.dir[i]);
                        c--;
                    }
                    else if (flag) {

                        if (c > 0) {

                            arrVisible.push(this.thumb.dir[i]);
                            c--;
                        }
                        else {
                            break;
                        }
                    }
                }
                /**
                 * 16 - 15 % 4 = 3 / |    16 - 4 = 12
                 * @type {number}
                 */

                //    3           =        15         %         4
                var countInLastRow = arrVisible.length % param.thumb.inRow;
                var rows = count - param.thumb.inRow;         //count thumbs in entire rows
                var countThumbsInFrame = rows + countInLastRow;
                var c = countThumbsInFrame;

                //console.log(countThumbsInFrame, countInLasRow, rows, param.thumb.inRow, 'cc'); //12 0 12 4 "cc" //15 3 12 4 "cc"

                if (arrVisible.length < countThumbsInFrame) { //3 < 15
                    arrVisible = [];
                    var i = this.thumb.dir.length;
                    while (c--) {
                        arrVisible.unshift(this.thumb.dir[--i]);
                    }
                }

                this.$set(this.thumb, 'frame', arrVisible);
                Vue.nextTick(function () {

                    arrVisible.forEach(function (item) {

                        thumbFromData(item.id, this.thumb.imgCache[item.id], function () {

                        });

                    }.bind(this));
                }.bind(this));

            }
            else {

                //rowsOffset = this.thumb.rowsTotal - 1;
                //indexOfStartThumbInFrame = Math.floor(rowsOffset * param.thumb.inRow);
                //item = this.thumb.dir[indexOfStartThumbInFrame];
                ////console.log(item, item.id, 'ii');
                //if (item) {
                //    this.thumbFrameSet(item.id);
                //}
            }

        },

        /**
         * @des move thumb vertical scroll
         * @param act
         */
        thumbScrollMoveByKey: function () {

            var sH = this.$root.thumb.scroll.height;
            var count = Math.floor(param.thumb.inRow * param.thumb.rows); //thumb in frame
            var thumbnailsHeight = this.thumb.thumbnails.height;

            if (this.thumb.dir.length < count) {
                return;
            }

            var rowsTotal = Math.ceil(this.thumb.dir.length / param.thumb.inRow);         //count thumbs in entire rows

            /**
             * To find
             * @type {number}
             */
            var indexFirstInFrame = this.thumb.frame[0].id;
            var countOfAboveThumbs = 0;                               //count of thumb above frame ( from first up to indexFirstInFrame )
            for (var i=0;i<this.thumb.dir.length;i++) {
                countOfAboveThumbs += 1;
                if (indexFirstInFrame == this.thumb.dir[i].id) {
                    break;
                }
            }

            //rows above frame
            var rowsTop = Math.floor(countOfAboveThumbs / param.thumb.inRow);

            var heightStepOfScroll = (thumbnailsHeight - sH) / rowsTotal;
            var scrollOffsetTop = Math.floor(heightStepOfScroll * rowsTop);

            this.$set(this.thumb.scroll, 'top', scrollOffsetTop);
        }

    }

};