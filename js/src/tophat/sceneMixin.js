/**
 *
 * @type {{
 *
 *  sceneSet (thumb),
 *
 * }}
 */
var sceneMixin = {

    computed: {

        //select scene bg
        sceneThumbSelected: function () {

            var sel = this.thumb.selected;
            var showed = this.thumb.showed;

            if (sel.indexOf(showed) > -1) {
                return true;
            }
            return false;
        },
    },

    methods: {

        antiAliasingSet: function(){

            if (!this.scene.antiAliasing) {
                this.$set(this.scene, 'antiAliasing', true);
            }
            else {
                this.$set(this.scene, 'antiAliasing', false);
            }

            this.$root.setFocus('thumb');

            var el = zz.q('#thumb-' + this.$root.thumb.showed);
            if (el) {
                el.click();
            }
        },

        /**
         * @des Rotate img
         */
        sceneRotate: function (degree) {

            var imgDrawnWidthNew = (this.scene.imgDrawnWidth * this.scene.percentCurrent) / this.scene.percentCurrent;
            var imgDrawnHeightNew = (this.scene.imgDrawnHeight * this.scene.percentCurrent) / this.scene.percentCurrent;
            var WH = calculateAspectRatio(this.scene.imgDrawnWidth, this.scene.imgDrawnHeight, imgDrawnWidthNew, imgDrawnHeightNew);
            var degree = degree || 90;

            var param = {
                    src: this.scene.src,
                    width: WH.w,
                    height: WH.h,
                    rotate: degree
                }

            sceneDraw(param, this.sceneParamNew);

        },

        sceneParamNew: function (param) {

            this.scene.imgOriginalWidth = param.width;
            this.scene.imgOriginalHeight = param.height;
            this.scene.left = param.left;
            this.scene.top = param.top;
            this.scene.imgDrawnWidth = param.imgDrawnWidth;
            this.scene.imgDrawnHeight = param.imgDrawnHeight;
            this.scene.offset.left = 0;
            this.scene.offset.top = 0;
        },

        sceneImgZoom: function (sign) {

            var sign = sign || 'minus';

            var stepPercent = 10;

            if ('minus' == sign) {
                stepPercent = -10;
            }

            var imgDrawnWidthNew = (this.scene.imgDrawnWidth * (this.scene.percentCurrent + stepPercent)) / this.scene.percentCurrent;
            var imgDrawnHeightNew = (this.scene.imgDrawnHeight * (this.scene.percentCurrent + stepPercent)) / this.scene.percentCurrent;
            var WH = calculateAspectRatio(this.scene.imgDrawnWidth, this.scene.imgDrawnHeight, imgDrawnWidthNew, imgDrawnHeightNew);

            var param = {
                    src: this.scene.src,
                    width: WH.w,
                    height: WH.h,
                }

            sceneDraw(param, this.sceneParamNew);
        },

        sceneImgZoomOut: function () {
            var stepPercent = 10;
        },

        sceneSet: function (thumb) {

            this.videoStreamClear();

            if (!thumb) {
                return;
            }

            //clear scene val
            this.scene.val = '';
            this.$set(this.scene, 'type', thumb.type);
            this.$set(this.scene, 'ext', thumb.ext);
            this.$set(this.scene.offset, 'top', 0);
            this.$set(this.scene.offset, 'left', 0);

            switch (thumb.type) {

                case 'img':

                    this.$set(this.scene, 'src', thumb.src);

                    var scene = zz.q('#scene');

                    if (scene) {
                        this.$set(this.scene, 'width', scene.offsetWidth);
                        this.$set(this.scene, 'height', scene.offsetHeight);
                    }

                    sceneLoad(thumb, {maxWidth: this.scene.width, maxHeight:this.scene.height, antiAliasing: this.scene.antiAliasing}, this.setSizeImgToScene);
                    break;

                case 'video':

                    this.videoParamReset();
                    this.$set(this.scene, 'src', thumb.src);

                    break;

                case 'audio':

                    this.$set(this.scene, 'src', thumb.src);

                    break;

                case 'text':

                    this.getFileContent(thumb.path, function(buffer){

                        var str = buffer.toString();

                        this.$set(this.scene, 'type', 'txt');
                        this.$set(this.scene, 'val', str);

                    }.bind(this));

                    break;

                case 'adobe':

                    this.$set(this.scene, 'src', thumb.src);

                    var scene = zz.q('#scene');

                    if (scene) {
                        this.$set(this.scene, 'width', scene.offsetWidth);
                        this.$set(this.scene, 'height', scene.offsetHeight);
                    }

                    sceneLoad(thumb, {
                        maxWidth: this.scene.width,
                        maxHeight:this.scene.height,
                        imgData: this.imgCachePreview[thumb.id]
                    }, this.setSizeImgToScene);

                    break;

                default:
                    this.$set(this.scene, 'type', 'none');
                    sceneLoad('clear');
            }
        },

        /**
         * @des move img inside scene
         * @param direction
         */
        sceneMove: function (direction) {

            var direction = direction || 'left';
            var param = {
                    src: this.scene.src,
                    width: this.scene.imgDrawnWidth,
                    height: this.scene.imgDrawnHeight,
                }
            var offset = 40;
            switch (direction) {

                case 'right':
                    param.left = this.scene.left + offset;
                    break;

                case 'left':
                    param.left = this.scene.left - offset;
                    break;

                case 'top':
                    param.top = this.scene.top + offset;
                    break;

                case 'bottom':
                    param.top = this.scene.top - offset;
                    break;

            }

            this.sceneMoveDraw(param);
        },
        /**
         * @des move img on scene if it need
         * @param param
         */
        sceneMoveDraw: function (param) {

            var sign, signTop, L2, H2, flagWidth = false, flagHeight = false;

            if (this.scene.imgDrawnWidth > this.scene.width) {

                sign = Math.sign(param.left);

                if (sign < 0) {

                    L2 = this.scene.imgDrawnWidth - Math.abs(param.left);

                    if (L2 < this.scene.width) {
                        param.left = (this.scene.imgDrawnWidth - this.scene.width) * sign;
                    }
                }
                else if (param.left > 0) {
                    param.left = 0;
                }
                flagWidth = true;
            }

            if (this.scene.imgDrawnHeight > this.scene.height) {

                signTop = Math.sign(param.top);

                if (signTop < 0) {

                    H2 = this.scene.imgDrawnHeight - Math.abs(param.top);

                    if (H2 < this.scene.height) {
                        param.top = (this.scene.imgDrawnHeight - this.scene.height) * signTop;
                    }
                }
                else if (param.top > 0) {
                    param.top = 0;
                }
                flagHeight = true;
            }

            if (!flagWidth && !flagHeight) {
                return;
            }

            sceneDraw(param, this.sceneParamNew);
        }
    }
};