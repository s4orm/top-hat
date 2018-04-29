/**
 *
 * top menu
 *
 */

var topMixin = {

    methods: {

        clickTopMenu: function (e) {

            var type = e.target.getAttribute('data-type');

            this.clickFocus('top');

            if (!type) {
                return;
            }

            switch (type) {


                case 'clickSettings':

                    this.clickSettingsMenu();
                    break;

                case 'clickImageResize':

                    this.clickImageResize();

                    break;


                case 'filter-img-only':

                    if (!this.$root.filter.imgOnly) {
                        this.$set(this.$root.filter, 'imgOnly', true);
                    }
                    else {
                        this.$set(this.$root.filter, 'imgOnly', false);
                    }

                    break;

                case 'clickZipFolders':

                    zz.window.confirm({
                        title: lang.confirm.zipChildrenFolders,
                        des: '<b>'+lang.confirm.zipChildrenFolders + '</b><br>',
                        el: [{
                            type: 'checkbox',
                            name: 'deleteFoldersAfterZip',
                            title: lang.confirm.deleteFoldersAfterZip
                        }]

                    }, function(answerParamObject) {

                        var answerParamObject = answerParamObject || {};
                        var params = {};

                        if (answerParamObject.el && answerParamObject.el.checkbox) {
                            for(var i in answerParamObject.el.checkbox) {
                                params[i] = answerParamObject.el.checkbox[i];

                            }
                        }


                        this.clickZipFolders(params);

                    }.bind(this));

                    break;

                case 'clickZipCutOne':
                    if (this.thumb.selected.length > 0) {
                        this.clickZipCutOne();
                    }
                    else {
                        zz.window.alert({
                            title: lang.alert.selectFiles,
                            timer: 5000,
                            des: '<b>' + lang.alert.selectFiles + '</b>'
                        }, undefined)
                    }

                    break;

                case 'clickDelete':

                    this.clickDelete();
                    break;

                case 'clickZip':

                    this.clickZip();
                    break;

                case 'clickCreateFile':

                    this.clickCreateFile();
                    break;

                case 'clickCreateDir':

                    this.createDir();
                    break;

                case 'clickAntiAliasing':

                    this.antiAliasingSet(); // on|off

                    break;

                case 'clickCloseUnpackTail':

                    if (!this.$root.flag.closeUnpackTail) {
                        this.$root.$set(this.$root.flag, 'closeUnpackTail', true);
                    }
                    else {
                        this.$root.$set(this.$root.flag, 'closeUnpackTail', false);
                    }

                    break;

                case 'clickHistoryBack':

                    var arrHistory = this.pathHistory;
                    var index = arrHistory.indexOf(this.fullpath),
                        indexPrev = 0,
                        pathPrev;

                    if (index > 0) {
                        indexPrev = index - 1;
                    }

                    pathPrev = arrHistory[indexPrev];

                    this.dirLoad(pathPrev);
                    var treeId = param.getIdByPath(pathPrev);

                    if (!treeId) {
                        return;
                    }

                    zz.q('#'+treeId + ' [data-act="clickDirName"]').click();

                    break;

                case 'clickHistoryForward':

                    var arrHistory = this.pathHistory;
                    var index = arrHistory.indexOf(this.fullpath),
                        indexForward = 0,
                        pathForward;

                    if (index != -1) {
                        indexForward = index + 1;
                    }

                    pathForward = arrHistory[indexForward];

                    if (!pathForward) {
                        return;
                    }

                    this.dirLoad(pathForward);
                    var treeId = param.getIdByPath(pathForward);

                    if (!treeId) {
                        return;
                    }

                    zz.q('#'+treeId + ' [data-act="clickDirName"]').click();

                    break;

                case 'clickRename':

                    this.dirRename(this.fullpath, function(){
                        this.console( this.fullpath + lang.confirm.wasDeleted);
                    }.bind(this));

                    break;

                case 'clickRenameGroup':

                    var list = [];

                    var selected = this.thumb.selected;

                    if (selected.length > 0) {

                        this.thumb.dir.forEach(function (item) {
                            if (selected.indexOf(item.id) != -1) {
                                list.push(item.name);
                            }
                        });
                    }
                    else {
                        this.thumb.dir.forEach(function (item) {

                            list.push(item.name);
                        });
                    }

                    var focusCache = this.focus;
                    this.setFocus('no');

                    zz.window.renameGroup({list:list}, function(tree) { //[{old:'name1' , new: 'name2'}, {}]

                        this.setFocus(focusCache);

                        var total = tree.length;
                        var counter = 0;

                        tree.forEach(function(item){

                            var thumb, oldPath, newPath;

                            for (var i=0;i<this.thumb.dir.length;i++) {

                                thumb = this.thumb.dir[i];

                                if (item.oldName == thumb.name) {

                                    oldPath = thumb.path;
                                    newPath = path.join(thumb.dir, item.newName);

                                    fs.rename(oldPath, newPath, function(){

                                        counter += 1;

                                        this.console(lang.total + total + ', ' + lang.renamed + counter);

                                        if (counter == total) {
                                            this.console(lang.renameFinish);
                                            if (param.tree.cachePaths[this.treeParam.idEnd].search(/\.zip$/i) != -1) {
                                                var tmpDir = param.tmpDirs[param.tree.cachePaths[this.treeParam.idEnd]];
                                                if (tmpDir) {
                                                    this.thumbLoad(tmpDir);
                                                }
                                            }
                                            else {
                                                this.thumbLoad(this.fullpath);
                                            }
                                        }

                                    }.bind(this));
                                }
                            }
                        }.bind(this));
                    }.bind(this));

                    break;

                case 'clickEpsStock':

                    this.stockEps10(this.fullpath);

                    break;

                case 'clickEpsStockCreateDir':

                    zz.window.file({title:lang.dir.new, des: lang.dir.name}, this.stockCreateFolder);

                    break;

                case 'clickRotateCounter':

                    this.sceneRotate(-90);
                    break;

                case 'clickRotate':

                    this.sceneRotate();
                    break;

                case 'clickBookmarksShow':

                    this.clickBookmarksShow();
                    break;

                //create
                case 'clickScriptGalleryDir':

                    /**
                     * 1. create new dir (default: gallery)
                     * 2. select img files in selected dir
                     * 3. move selected files in new dir
                     * 4. zip new dir
                     *
                     */
                    break;

                default:
            }
        }
    }
};