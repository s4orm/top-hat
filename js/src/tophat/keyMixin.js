
var keyMixin = {

    methods: {

        keyCommandsSetCache: function () {

            var commands = param.keyCommands,
                command,
                focusName,
                i, f;

            for (i = 0; i < commands.length; i++) {

                command = commands[i];

                if (command.focus) {

                    for (f=0;f<command.focus.length;f++) {
                        focusName = command.focus[f];
                        if (!param.keyCommandsCache[focusName]) {
                            param.keyCommandsCache[focusName] = {};
                        }
                        param.keyCommandsCache[focusName][command.keyStr] = command.name;
                    }
                }
                else {
                    param.keyCommandsCache['all'][command.keyStr] = command.name;
                }
            }
        },

        keyDown: function (e) {

            var keyStr = this.keyToStr(e);
            var focus = this.focus;
            var command;

            if ('' == keyStr) {
                return;
            }

            if (param.keyCommandsCache[focus]) {
                command = param.keyCommandsCache[focus][keyStr];

                if (!command) {
                    //all
                    focus = 'all';
                    if (param.keyCommandsCache[focus][keyStr]) {
                        command = param.keyCommandsCache[focus][keyStr];

                    }
                    if (!command) {
                        return;
                    }
                }
            }

            if (!command) {
                return;
            }

            if ('thumb' == focus) {

                switch (command) {

                    case 'antiAliasing':

                        this.antiAliasingSet();
                        break;

                    case 'zip':

                        this.zipFiles();
                        break;

                    case 'thumbMarkSet':
                        this.thumbMarkSet();
                        break;

                    case 'thumbMarkJumpTo':
                        this.thumbMarkJumpTo();
                        break;

                    case 'thumbSelectAll':
                        this.thumbSelectAll();
                        break;

                    case 'thumbUnselectAll':
                        this.thumbUnselectAll();
                        break;

                    case 'thumbNextRow':
                        //console.log(this.scene.type);
                        if (this.scene.type != 'video') {
                            this.thumbGoShow('nextRow');
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'thumbPrevRow':
                        if (this.scene.type != 'video') {
                            this.thumbGoShow('prevRow');
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'thumbNextShow':
                        this.thumbGoShow('next');
                        this.thumbScrollMoveByKey();
                        break;

                    case 'thumbPrevShow':
                        this.thumbGoShow('prev');
                        this.thumbScrollMoveByKey();
                        break;

                    case 'endShow':
                        if (this.scene.type != 'video') {
                            this.thumbGoShow('end');
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'homeShow':
                        if (this.scene.type != 'video') {
                            this.thumbGoShow('home');
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'nextSelect':
                        this.thumbSelectByIdMode(this.thumb.showed);
                        this.thumbGoShow('next');
                        this.thumbScrollMoveByKey();
                        break;

                    case 'prevSelect':
                        this.thumbSelectByIdMode(this.thumb.showed);
                        this.thumbGoShow('prev');
                        this.thumbScrollMoveByKey();
                        break;

                    case 'prevRowSelect':
                        if (this.scene.type != 'video') {
                            this.thumbGoShow('prevRow')
                            this.thumbSelectByIdMode(this.thumb.showed, 'prevRow');
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'nextRowSelect':
                        if (this.scene.type != 'video') {
                            this.thumbSelectByIdMode(this.thumb.showed, 'nextRow');
                            this.thumbGoShow('nextRow')
                            this.thumbScrollMoveByKey();
                        }
                        break;

                    case 'delete':

                        this.delete();
                        break;

                    case 'deleteDir':

                        this.delete('dir');
                        break;

                    case 'nextDir':

                        zz.q('#block-tree').blur();
                        this.treeDirGo('next');
                        break;

                    case 'prevDir':

                        zz.q('#block-tree').blur();
                        this.treeDirGo('prev');
                        break;

                    case 'thumbImgFullscreen':
                        if (false === this.fullscreen) {
                            gui.Window.get().enterFullscreen();
                            this.$set(this, 'fullscreen', true);

                        }
                        else {
                            gui.Window.get().leaveFullscreen();
                            this.$set(this, 'fullscreen', false);
                        }
                        break;

                    case 'repackArch':

                        var elTreeBranch = zz.q('#'+this.treeParam.idEnd+' [data-act="repack"]');
                            if (elTreeBranch) {
                                elTreeBranch.click();
                            }
                        break;
                }
            }

            if ('dir' == focus) {

                switch (command) {

                    case 'dirRename':
                        this.dirRename(this.fullpath);
                        break;

                    case 'zip':
                        this.zipFolderById();
                        break;

                    case 'deleteDir':

                        this.delete('dir');
                        break;

                    case '':

                        break;

                    case '':

                        break;

                    case '':

                        break;

                }
            }

            if ('scene' == focus) {

                switch (this.scene.type) {

                    case 'video':

                        switch (command) {

                            case 'videoNextSec':
                                this.videoNextSec(3);
                                break;

                            case 'videoPrevSec':
                                this.videoPrevSec(3);
                                break;

                            case 'videoNextSec10':
                                this.videoNextSec(10);
                                break;

                            case 'videoPrevSec10':
                                this.videoPrevSec(10);
                                break;

                            case 'videoNextSec30':
                                this.videoNextSec(30);
                                break;

                            case 'videoNextSec30arrowTop':
                                this.videoNextSec(30);
                                break;

                            case 'videoPrevSec30':
                                this.videoPrevSec(30);
                                break;

                            case 'videoStartPause':
                                this.videoStartPause();
                                break;

                            case 'videoStartPause2':
                                this.videoStartPause();
                                break;

                            case 'videoFullscreen':
                                this.videoFullscreen();
                                break;

                            case 'videoExitFullscreen':
                                this.videoExitFullscreen();
                                break;
                        }

                        break;

                    case 'txt':


                        switch(command){

                            case 'textSelect':

                                var sceneTextEl = zz.q('#sceneText');
                                sceneTextEl.setSelectionRange(0, sceneTextEl.value.length);
                                break;

                            case 'saveFile':
                                this.saveFile();
                                break;

                        }
                        break;

                    case 'img':

                        switch (command) {

                            case 'sceneImgZoomPlus':
                                this.sceneImgZoom('plus');
                                break;

                            case 'sceneImgZoomMinus':

                                this.sceneImgZoom('minus');
                                break;

                            case 'sceneMove':

                                this.sceneMove('left');
                                break;

                            case 'sceneMoveRight':

                                this.sceneMove('right');
                                break;

                            case 'sceneMoveTop':

                                this.sceneMove('top');
                                break;

                            case 'sceneMoveBottom':

                                this.sceneMove('bottom');
                                break;

                        }
                        break;
                }
            }

            if ('all' == focus) {

                switch (command) {

                    case 'closeProgramm':
                        this.closeProgramm();
                        break;

                    case 'fullscreenWindow':

                        if (false === this.fullscreen) {
                            gui.Window.get().enterFullscreen();
                            this.$set(this, 'fullscreen', true);

                        }
                        else {
                            gui.Window.get().leaveFullscreen();
                            this.$set(this, 'fullscreen', false);
                        }
                        break;
                }
            }

        },

        /**
         * @des Transform event to string command ex:'ctrl+shift+q'
         * @param e
         * @returns {string}
         */
        keyToStr: function (e) {

            var key = e.keyCode;
            var str = [];

            if (e.ctrlKey) {
                str.push('ctrl');
            }

            if (e.shiftKey) {
                str.push('shift');
            }

            if (e.altKey) {
                str.push('alt');
            }

            if (param.key[key]) {
                str.push(param.key[key]);
            }

            return str.join('+');
        },
    }
};