var dragAndDropMixin = {

    methods: {
        /**
         * @des bind in vue tpl with data-dd
         * @param e
         */
        ddMouseInit: function (e, offset) {

            var act = offset.data_dd;

            if (!act) {
                return;
            }

            switch (act) {

                case 'thumb-scroll':

                    this.$set(this.thumb.scroll, 'active', true); //change bgcolor for scroll block

                    var heightOffset = this.thumb.thumbnails.height - this.thumb.scroll.height;
                    var heightScrollOffsetRow = Math.floor(heightOffset / this.thumb.rowsTotal);     //height in px of row on scroll vertical line

                    this.thumb.scroll.heightScrollOffsetRow = heightScrollOffsetRow;

                    break;

                case 'middle-vl':


                    var leftBlock = zz.q('#block-middle-left');

                    param.resizer.verticalLineInitX = e.clientX; //need for compute width of left block in callback

                    param.resizer.ghostEl = zz.q('#middle-left-vl-ghost');
                    param.resizer.ghostEl.style.height = leftBlock.offsetHeight + 'px';
                    param.resizer.ghostEl.style.left = e.clientX + 'px';
                    param.resizer.ghostEl.style.display = '';

                    break;

                case 'video-scroll':

                    var width = zz.q('#block-video-scroll').offsetWidth || 1000;

                    width -= 10;

                    this.$set(this.video.scroll, 'active', true); //change bgcolor for scroll block
                    this.$set(this.video.scroll, 'width', width); //change bgcolor for scroll block

                    break;
            }
        },
        /**
         * @des bind in vue tpl with data-dd
         * @param e
         */
        ddMouseMove: function (e, offset) {

            var act = offset.data_dd;

            if (!act) {
                return;
            }

            switch (act) {

                case 'sceneCanvas':
                    //console.log('sceneCanvas', 'ddMouseMove', e);

                    /**
                     * this.scene
                     * {
                         ext: "jpg"
                         height: 1086
                         imgDrawnHeight: 3340
                         imgDrawnWidth: 2233
                         imgOriginalHeight: 2000
                         imgOriginalWidth: 1333
                         left: -416
                         percentCurrent: 100
                         src: "file:///.../dir/b2.jpg"
                         top: -1127
                         type: "img"
                         val: ""
                         width: 1400
                     }
                     */

                    var paramOffset = {
                            src: this.scene.src,
                            width: this.scene.imgDrawnWidth,
                            height: this.scene.imgDrawnHeight,
                            left: this.scene.left,
                            top: this.scene.top
                        };

                        paramOffset.left = this.scene.left + offset.left;
                        paramOffset.top = this.scene.top + offset.top;

                    this.sceneMoveDraw(paramOffset);

                    break;

                case 'thumb-scroll':

                    this.thumbScrollMouseMove(offset); //thumbScrollMixin.js
                    break;

                case 'middle-vl':

                    this.ddMiddleVLMouseMove(e); //dragAndDropMixin.js
                    break;

                case 'video-scroll':

                    this.videoScrollMouseMove(offset); //thumbScrollMixin.js
                    break;
            }
        },


        /**
         * @des bind in vue tpl with data-dd
         * @param e
         */
        ddCallback: function (e, offset) {

            var ddTarget = e.target;
            var act = ddTarget.getAttribute('data-dd');

            if (offset.data_dd == 'thumb-scroll') {
                act = 'thumb-scroll';
            }

            //fix
            if (offset.data_dd == 'video-scroll') {
                act = 'video-scroll';
            }

            //fix
            if (offset.data_dd == 'middle-vl') {
                act = 'middle-vl';
            }

            if (!act) {
                return;
            }

            switch (act) {

                //change bgcolor for scroll block
                case 'thumb-scroll':

                    this.$set(this.thumb.scroll, 'active', false);
                    break;


                case 'middle-vl':
                    var xInit = param.resizer.verticalLineInitX;
                    var xStop = e.clientX;
                    var offsetX = xInit - xStop;
                    var leftBlock = zz.q('#block-middle-left');

                    if (!leftBlock) {
                        return;
                    }

                    var widthBlock = leftBlock.offsetWidth;
                    var widthNew = widthBlock - offsetX;

                    leftBlock.style.width = widthNew + 'px';

                    param.resizer.ghostEl.style.left = e.clientX + 'px';
                    param.resizer.ghostEl.style.display = 'none';

                    var thumbEl = zz.q('#thumb');
                    var widthBlock = thumbEl.offsetWidth;
                    var heightBlock = thumbEl.offsetHeight;

                    param.thumb.blockWidth = widthBlock;

                    param.thumb.inRow = Math.floor(widthBlock / param.thumb.width);
                    param.thumb.rows = Math.floor(heightBlock / param.thumb.rowHeight);


                    break;

                //change bgcolor for scroll block
                case 'video-scroll':

                    this.$set(this.video.scroll, 'active', false); //change bgcolor for scroll block
                    var sec = Math.floor(this.video.scroll.left * this.video.durationSec / this.video.scroll.width);

                    //var timeMinSec = zz.remainder(sec, 60);
                    //var time = timeMinSec.int + ', ' + timeMinSec.remainder;

                    this.videoNextSecond(sec, 'set');

                    break;

                case 'tree':

                    var selected = this.thumb.selected;

                    if (selected.length > 0) {

                        //var oldPathDir = param.getPathById(this.treeParam.idEnd);
                        var newPathDir = param.getPathById(ddTarget.getAttribute('data-id'));

                        if (selected.length < 1) {
                            return;
                        }

                        var title = lang.dd.files;
                        var des = lang.selected + ":" + selected.length;

                        if (e.ctrlKey) {
                            title = lang.dd.filesCopy;
                        }

                        zz.window.confirm({title:title, des: des}, function() {

                            var total = selected.length;
                            var counter = 0;


                            selected.forEach(function (id) {

                                var thumb = this.getThumbById(id);

                                var oldPath = thumb.path;
                                var newPath = path.join(newPathDir, thumb.name);

                                //copy
                                if (e.ctrlKey) {

                                    this.copyFile(oldPath, newPath, function (err) {

                                        if (err) {
                                            throw err;
                                        }

                                        ++counter;

                                        //at the end
                                        if (counter >= total) {

                                            //after files moved
                                            this.console('copied');
                                        }

                                    }.bind(this));
                                }
                                else { //move

                                    fs.rename(oldPath, newPath, function (err) {

                                        if (err) {
                                            throw err;
                                        }

                                        this.deleteThumbById(id);
                                        ++counter;

                                        //at the end
                                        if (counter >= total) {

                                            //after files moved
                                            this.deleteThumbEnd(counter);
                                            var pathTmp = param.getPathById(this.treeParam.idEnd);

                                            var s = pathTmp.split(path.sep); //s[1] - tmp, s[2] - tophat.20dkdied029383

                                            for (var i in param.tmpDirs) {

                                                if (param.tmpDirs[i].search(s[2]) != -1) {
                                                    this.zipChanged[i] = true;
                                                }
                                            }

                                            this.selectDir(this.fullpath);
                                        }

                                    }.bind(this));
                                }

                            }.bind(this));

                        }.bind(this));

                    }
                    else {
                        //console.log(ddTarget.getAttribute('data-id'), 'tree');
                    }
                    break;

                case 'sceneCanvas':

                    //console.log('sceneCanvas', 'callback', e);

                    break;

            }
        },

        /**
         * @des vertical line sizer of left part (thumb and dir)
         */
        ddMiddleVLMouseMove: function (e) {

            param.resizer.ghostEl.style.left = e.clientX + 'px';

            var thumbEl = zz.q('#thumb');
            var widthBlock = thumbEl.offsetWidth;
            var heightBlock = thumbEl.offsetHeight;

            param.thumb.blockWidth = widthBlock;

            param.thumb.inRow = Math.floor(widthBlock / param.thumb.width);
            param.thumb.rows = Math.floor(heightBlock / param.thumb.rowHeight);

        },
    },

};