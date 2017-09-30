const fs = require('fs');
const os = require('os');

const crypto = require('crypto');
const path = require('path');
const archiver = require('archiver');
//const Iconv = require('iconv').Iconv;
const iconv = require('iconv-lite');
const exec = require('child_process').exec;
//const spawn = require('child_process').spawn;

const DecompressZip = require('decompress-zip');

var gui = require('nw.gui');
var win = gui.Window.get();
var argv = gui.App.argv; //qui.App.argv[0] - "/home/user/local/nw/images/clean.jpg"

//image open with
var __startImg = false;
var __startDir = false;
var __startPath = false;

if (argv.length > 0) {
    __startPath = argv[0]; //"/home/user/local/nw/images/clean.jpg"

    var __startPathMatch = __startPath.match(/[^/]+$/); //"/home/user/local/nw/images/clean.jpg"
    if (__startPathMatch.length > 0) {
        __startImg = __startPathMatch[0];
    }
    __startDir = __startPath.replace(/[^/]+$/, '').replace(/\/$/, '');
}

if (!__startDir) {
    __startDir = process.cwd();// + '/images';
}

win.maximize();

var lang = lang.en;

var ennoble = function (obj) {
    JSON.parse(JSON.stringify(obj));
}
var ennobleConsole = function (obj) {
    console.log(JSON.parse(JSON.stringify(obj)));
}

var app = new Vue({

    mixins: [thumbMixin, sceneMixin, searchMixin, treeMixin, zipMixin, dirMixin, fileMixin, deleteMixin, keyMixin, libMixin, thumbShowMixin, thumbScrollMixin, dragAndDropMixin, topMixin, bookmarksMixin, stockMixin, videoMixin],

    el: "#app",

    data: {

        tree: {},

        treeParam: {
            idEnd: 0 //selected dir or zip file
        },

        bookmarks: [],

        treeTabSelected: 'tree', //bookmarks, tree

        search: {
            list: {},
            val: '',
            turnOff: false
        },

        file: {
            autoUnzipLimit: 300 //mb
        },

        fullpath: '/',
        fullpathArr: [],
        pathHistory: [],

        imgCachePreview: {},

        thumb: {

            cache: {
                dir: [],
                idRow: null,  //{id: numRow, ... id: numRow }
                rows: []    //array ( 0: null, 1: [0, 1, 2, 3], 2: [4, 5, 6, 7] ... ) <- for row where 4 thumb in row
            },

            dir: [],
            frame: [],
            imgCache: {},
            width: 106,
            height: 80,
            heightFullLength: 142,
            mark: false,             //mark (index of thumb) for jump to mark by key "T"
            selected: [],
            showed: 0, //index in thumbnails array
            type: 'img', //showed now type. It need for keyboard shortcut
            //El: null,
            threadsLoadingDir: [], // thumbMixin thumbLoad, for break loading dir if selected new dir . Create uniq thread, if is new thread, break before thread and delete it ['timestamp', 'timestamp']
            thumbnails: {
                el: null,
                height: 0
            },

            rowsTotal: 0,

            scroll: {
                topInit: 2,
                bottomInit: 2,
                top: 2,
                bottom: 2,
                height: 200,
                active: false,
                heightScrollOffsetRow: 0, //height in px of row on scroll vertical line
            },

            sort: {
                name: { to: 'increase', arrow: lang.arrow.down}, //decrease
                date: { to: 'decrease', arrow: ''} //decrease
            }
        },

        flag: {

            show: {
                dirFullpath: false
            },

            loading: false,
            loadingVideoStream: false,
        },

        fullscreen: false,

        zipChanged: {}, //obj list of fullpath dirs which was changed

        video: {

            el: null,
            duration: 0,
            durationSec: 0,
            sec: 0,
            timeCurrent:0,
            fullscreen: false,

            scroll: {
                width: 0,
                active: false,
                left: 0
            },

            //param: '#transcode{vcodec=theo,vb=1024,acodec=vorb,ab=128,channels=2,samplerate=44100}:standard{access=http,mux=ogg,',
            param: '#transcode{vcodec=theo,acodec=vorb,channels=2}:standard{access=http,mux=ogg,',
            stream: '127.0.0.1:1234/video',
            streamHTTP: 'http://127.0.0.1:1234',
            streamStartTime: 0,
            streamStatus: false

        },

        focus: 'thumb',

        //topMenu: {
        //    clickDelete: false
        //},

        flagConfirm: {
            delete: false
        },

        scene: {
            width: 800,
            height: 800,
            src: '',
            antiAliasing: false,
            imgOriginalWidth: 0,
            imgOriginalHeight: 0,
            left: 0,
            top: 0,
            imgDrawnWidth: 0,
            imgDrawnHeight: 0,
            percentCurrent: 100,
            offset: {
                left: 0,
                top: 0
            }
        },

        loading: {

            unzip: 0,

            unpackingId: -1,

            percent: 0,

            thumb: {
                total: 0,
                loaded: 0,
                scrollHeight: 0,
                scrollTop: 0,
                scrollTopCache: 0, //cache scroll 1243 and so on so forth.
                elDOM: null
            }
        }
    },

    computed: {

        selected: function () {

            var sel = this.thumb.selected;
            var showed = this.thumb.showed;

            if (sel.indexOf(showed) > -1) {
                return true;
            }
            return false;
        },

        numThumb: function () {

            var count = 1;

            for (var i=0; i<this.thumb.dir.length; i++) {
                if (this.thumb.showed == this.thumb.dir[i].id) {
                    break;
                }
                count++;
            }

            return count;
        },
        isAntiAliasing: function () {

           return this.scene.antiAliasing;
        },

        isFullscreen: function () {

           return this.fullscreen;
        },

    },

    methods: {
        /**
         * @des read list of files in dir and create thumbnails
         * @param dirPath dir for loading
         */
        init: function (dirPath) {

            this.setFocus(this.focus);

            var dir = dirPath || __startDir;

            this.$set(this, 'fullpath', dir);
            this.dirFullpathArr(dir);

            this.pathHistory.push(dir);

            //create tree without zip (for zip it is parent dir)

            if (param.startApp) {

                this.treeInit();
            }

            this.thumbLoad(dir);

            setTimeout(function () {

                this.loading.thumb.elDOM = zz.q('.thumbnails');

                if (__startPath) {

                    if ('zip' == zz.getExtFromPath(__startPath)) {


                        var sizeFile = this.getFileSizeSync(__startPath);

                        var treeId = param.getIdByPath(__startPath);

                        //if size file < 200 mb open archive (unpack)
                        if (sizeFile.sizeOriginal < this.file.autoUnzipLimit * 1000000) {

                            var zipNode = zz.q('#' + treeId + ' [data-act="clickUnzip"]');
                            if (zipNode) {
                                zipNode.click();
                            }
                        }
                        else {
                            zz.q('#' + treeId + ' [data-act="clickDirName"]').click();
                        }

                        //
                        //
                        //var elTreeBranch = zz.q('#'+treeId+' [data-act="clickDirName"]');
                        //    if (elTreeBranch) {
                        //        elTreeBranch.click();
                        //    }
                    }
                }

            }.bind(this), 1000);

            //read file of bookmarks, if there is. If there is not then create new bookmark file
            this.bookmarksRead();

        },

        closeProgramm: function () {

            var dirs = param.tmpDirs,
                dir;

            for (var i in dirs) {

                dir = dirs[i];

                this.deleteDirRecursive(dir);
            }

            if (param.exec && param.exec.pid) {
                process.kill(param.exec.pid + 1);
            }

            win.close(true);
        },

        loadingStart: function() {
            this.$set(this.flag, 'loading', true);
        },

        loadingEnd: function() {
            this.$set(this.flag, 'loading', false);
        },

        //event mouse wheel
        wheel: function(e) {

            var deltaY = e.deltaY;

            if (!deltaY) {
                return;
            }
            //zoom by Ctrl + wheel

            if (e.ctrlKey) {

                if (['jpg', 'jpeg', 'png', 'gif', 'eps', 'ai', 'svg'].indexOf(this.scene.ext) != -1) {

                    if (deltaY > 0) {
                        //this.nextShow();
                        this.sceneImgZoom('plus');
                    }
                    else {
                        //this.prevShow();
                        this.sceneImgZoom('minus');
                    }
                }
            }
            //scroll thumb
            else {
                if (deltaY > 0) {
                    this.thumbGoShow('next');
                    this.thumbScrollMoveByKey();
                }
                else {
                    this.thumbGoShow('prev');
                    this.thumbScrollMoveByKey();
                }
            }

        },

        clickFocus: function(focus) {

            if (!focus) {
                return;
            }
            this.$set(this, 'focus', focus);
        },

        setFocus: function(focus) {

            if (!focus) {
                return;
            }

            this.$set(this, 'focus', focus);

            if ('no' == focus) {
                return;
            }

            var blockEl;

            switch (focus) {

                case 'thumb':
                    blockEl = zz.q('#' + focus);
                    if (blockEl) {
                        blockEl.focus();
                    }

                default:
                    blockEl = zz.q('#block-' + focus);
                    if (blockEl) {
                        blockEl.focus();
                    }
            }
        },

        setSizeImgToScene: function (param){

            var msg = ' ' + param.width + 'x' + param.height;
            //cache original img width and height to this.scene
            this.scene.imgOriginalWidth = param.width;
            this.scene.imgOriginalHeight = param.height;
            this.scene.left = param.left;
            this.scene.top = param.top;
            this.scene.imgDrawnWidth = param.imgDrawnWidth;
            this.scene.imgDrawnHeight = param.imgDrawnHeight;
            this.scene.offset.left = 0;
            this.scene.offset.top = 0;
            this.console(msg, 'append');
        },
    },

    mounted: function () {

        this.init(__startDir);

        //bind keyboard commands
        this.keyCommandsSetCache();

        setTimeout(function () {

            var thumbnailsEl = zz.q('#thumb');
            var thumb;

            if (this.thumb.dir.length > 0) {

                if (__startImg) {

                    thumb = this.thumbSelectBy('name', __startImg);
                }
                else {

                    thumb = this.thumbSelectById(this.thumbGetIndex('first'));
                }

                if (thumb) {

                    if (this.thumb.selected.length == 0) {
                        this.sceneSet(thumb);
                    }
                    this.console(thumb.name);
                    this.size(thumb);
                }
            }

            this.thumb.thumbnails.el = thumbnailsEl;
            this.thumb.thumbnails.height = thumbnailsEl.offsetHeight;

            thumbnailsEl.focus();

            document.body.addEventListener('keydown', this.keyDown, false);

            zz.q('#thumb').addEventListener('wheel', this.wheel, false);

            zz.q('#block-scene').addEventListener('wheel', this.wheel, false);
            window.addEventListener('resize', this.resizeWin, true);
            win.on('close', this.closeProgramm, true);

            document.ondragstart = function() { return false };
            document.body.onselectstart = function() { return false };

            var start = zz.q('#start');
            start.parentNode.removeChild(start);

            //drag and drop init
            zz.dd.init({
                sel: '#block-middle-left',
                title: 'move',
                titleCtrl: 'copy',
                callback: this.ddCallback,
                boxDataDD: ['tree', 'thumb']
            });

            //drag and drop init
            zz.dd.init({
                sel: '#app',
                mouseInit: this.ddMouseInit,
                mouseMove: this.ddMouseMove,
                callback: this.ddCallback
            });

        }.bind(this), 1000);


    }
});
