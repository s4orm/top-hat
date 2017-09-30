
var param = {

    programName: 'tophat',
    bookmarksFileName: 'tophat_bookmarks.json',

    tmpDirs: {}, //cache original fullpath, tmp path

    startApp: true,

    thumb: {

        blockHeight: 511,
        blockWidth: 650,

        width: 122,
        height: 142,
        inRow: 4,
        rows: 4,
        rowHeight: 162.5,
    },

    resizer: {
        verticalLineInitX: 0,
        ghostEl: null
    },

    video: {
       sec: 0
    },

    exec: null, //need for trick with video stream vlc (create, procecc.kill(exec.pid))

    tree: {
        cachePaths: {}, //['treeRoot'] is root
    },

    pathSeparator: '/',

    keyDown: null,
    keyUp: null,
    key: {
        arrowRight: 39,
        arrowLeft: 37,
        arrowTop: 38,
        arrowBottom: 40,
        end: 35,
        home: 36,
        delete: 46,
        space: 32,
        apostrophe: 192,
        esc: 27,
        equal: 187,
        minus: 189,
        pageUp: 33,
        pageDown: 34,
        enter: 13,
        f11: 122,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        13:"enter",
        27:"esc",
        32:"space",
        33:"pageUp",
        34:"pageDown",
        35:"end",
        36:"home",
        37:"arrowLeft",
        38:"arrowTop",
        39:"arrowRight",
        40:"arrowBottom",
        46:"delete",
        65:"a",
        66:"b",
        67:"c",
        68:"d",
        69:"e",
        70:"f",
        71:"g",
        72:"h",
        73:"i",
        74:"j",
        75:"k",
        76:"l",
        77:"m",
        78:"n",
        79:"o",
        80:"p",
        81:"q",
        82:"r",
        83:"s",
        84:"t",
        85:"u",
        86:"v",
        87:"w",
        88:"x",
        89:"y",
        90:"z",
        122:"f11",
        187:"equal",
        189:"minus",
        192:"apostrophe"
    },

    getIdByPath: function (dirPath) {
        var cachPaths = param.tree.cachePaths;
        for (var i in cachPaths) {
            if (dirPath == cachPaths[i]) {
                return i;
            }
        }
    },

    getPathById: function (id) {

        if (!id) {
            return false;
        }
        if (param.tree.cachePaths[id]) {
            return param.tree.cachePaths[id];
        }

        return false;
    },

    /**
     * @des search original dir Object {/home/user/images/images2.zip: "/tmp/tophat.474d34d4b1b72323bab4e"}
     * @param path
     * @returns {string}
     */
    getOribinalPathByTmp: function (path) {

        var item;

        for (var i in param.tmpDirs) {
            item = param.tmpDirs[i];
            if (path == item) {
                return i;
                break;
            }
        }
    },

    removePathById: function (id) {

        delete param.tree.cachePaths[id];
    },
    //fix file protocol bag
    encUrl: function(str) {
        return encodeURI(str).replace(/#/img, '%23');
    },

    /**
     * @des "/tmp/tophat.474d34d4b1b72323bab4e/images/img" -> "/tmp/tophat.474d34d4b1b72323bab4e"
     * @param fullpath
     * @returns {string}
     */
    getTmpDirFromPath: function(fullpath) {

        //linux
        var arrPath = fullpath.split(path.sep);
        var pathFolder = '/' + path.join(arrPath[1], arrPath[2]);

        return pathFolder;
    }

}

/**
 * sequence: ctrl+shift+alt+win+key
 */

param.keyCommandsCache = {
    all: {},
    thumb: {},
    dir: {},
    scene: {}
};
param.keyCommands = [

    { name: 'closeProgramm', keyStr: 'ctrl+q' },
    { name: 'saveFile', keyStr: 'ctrl+s', focus: ['scene'] },
    { name: 'dirRename', keyStr: 'shift+r', focus: ['dir'] },

    { name: 'zip', keyStr: 'shift+z', focus: ['thumb','dir'] },

    { name: 'thumbMarkSet', keyStr: 't', focus: ['thumb'] },
    { name: 'thumbMarkJumpTo', keyStr: 'ctrl+t', focus: ['thumb'] },
    { name: 'thumbSelectAll', keyStr: 'ctrl+a', focus: ['thumb'] },
    { name: 'thumbUnselectAll', keyStr: 'ctrl+shift+a', focus: ['thumb'] },
    { name: 'thumbNextRow', keyStr: 'c', focus: ['thumb'] },
    { name: 'thumbPrevRow', keyStr: 'd', focus: ['thumb'] },
    { name: 'thumbNextShow', keyStr: 'arrowRight', focus: ['thumb'] },
    { name: 'thumbPrevShow', keyStr: 'arrowLeft', focus: ['thumb'] },
    { name: 'endShow', keyStr: 'end', focus: ['thumb'] },
    { name: 'homeShow', keyStr: 'home', focus: ['thumb'] },
    { name: 'nextSelect', keyStr: 'b', focus: ['thumb'] },
    { name: 'prevSelect', keyStr: 'v', focus: ['thumb'] },
    { name: 'prevRowSelect', keyStr: 's', focus: ['thumb'] },
    { name: 'nextRowSelect', keyStr: 'g', focus: ['thumb'] },
    { name: 'delete', keyStr: 'delete', focus: ['thumb'] },
    { name: 'prevDir', keyStr: 'ctrl+arrowLeft', focus: ['thumb'] },
    { name: 'nextDir', keyStr: 'ctrl+arrowRight', focus: ['thumb'] },
    { name: 'prevDir', keyStr: 'pageUp', focus: ['thumb'] },
    { name: 'nextDir', keyStr: 'pageDown', focus: ['thumb'] },
    { name: 'repackArch', keyStr: 'ctrl+r', focus: ['thumb'] },

    { name: 'thumbImgFullscreen', keyStr: 'f', focus: ['thumb'] },

    { name: 'sceneImgZoomPlus', keyStr: 'equal', focus: ['scene'] },
    { name: 'sceneImgZoomMinus', keyStr: 'minus', focus: ['scene'] },
    { name: 'sceneMove', keyStr: 'arrowLeft', focus: ['scene'] },
    { name: 'sceneMoveRight', keyStr: 'arrowRight', focus: ['scene'] },
    { name: 'sceneMoveTop', keyStr: 'arrowTop', focus: ['scene'] },
    { name: 'sceneMoveBottom', keyStr: 'arrowBottom', focus: ['scene'] },

    { name: 'deleteDir', keyStr: 'ctrl+delete', focus: ['dir'] },


    { name: 'videoNextSec', keyStr: 'b', focus: ['scene'], type: 'video' },
    { name: 'videoPrevSec', keyStr: 'v', focus: ['scene'], type: 'video' },
    { name: 'videoNextSec10', keyStr: 'arrowRight', focus: ['scene'], type: 'video' },
    { name: 'videoPrevSec10', keyStr: 'arrowLeft', focus: ['scene'], type: 'video' },
    { name: 'videoNextSec30', keyStr: 'g', focus: ['scene'], type: 'video' },
    { name: 'videoNextSec30arrowTop', keyStr: 'arrowTop', focus: ['scene'], type: 'video' },
    { name: 'videoPrevSec30', keyStr: 'arrowBottom', focus: ['scene'], type: 'video' },
    { name: 'videoStartPause', keyStr: 'space', focus: ['scene'], type: 'video' },
    { name: 'videoStartPause2', keyStr: 'apostrophe', focus: ['scene'], type: 'video' },
    { name: 'videoFullscreen', keyStr: 'f', focus: ['scene'], type: 'video' },
    { name: 'videoExitFullscreen', keyStr: 'esc', focus: ['scene'], type: 'video' },

    { name: 'textSelect', keyStr: 'a', focus: ['scene'], type: 'txt' },
    { name: 'fullscreenWindow', keyStr: 'f11' },
];
//zz.appendToObj(
//    param.key, {
//        //prevSelect: param.key.v,
//        //nextSelect: param.key.b,
//        //prevRow: param.key.d,
//        //nextRow: param.key.c,
//        //prevRowSelect: param.key.f,
//        //nextRowSelect: param.key.g,
//    }
//);