var deleteMixin = {

    methods: {

        clickDelete: function () {

            this.delete();
        },

        delete: function(act) {

            var selected = this.thumb.selected;
            var act = act || 'thumb',
                title = '',
                des;

            switch (act) {

                case 'thumb':

                    if (selected.length < 1) {
                        this.thumbSelectByIdMode(this.thumb.showed);
                        //return;
                    }

                    title = lang.delete;
                    des = lang.confirm.delete + selected.length + lang.confirm.deleteEnd;

                    var focusCache = this.focus;
                    this.setFocus('no');

                    zz.window.confirm({title:title, des: des}, function() {

                        this.setFocus(focusCache);

                        this.$root.loadingStart();

                        var isZipFlag = false;

                        //start delete
                        var selected = this.thumb.selected;
                        var total = selected.length;
                        var counter = 0;

                        selected.forEach(function (id) {

                            var thumb = this.getThumbById(id);

                            if (['zip', 'rar'].includes(thumb.ext)) {
                                isZipFlag = true;
                            }

                            fs.unlink(thumb.path, function(){

                                this.deleteThumbById(id);
                                ++counter;

                                //at the end
                                if (counter >= total) {

                                    this.thumbCache();
                                    //after files deleted
                                    this.deleteThumbEnd(counter, isZipFlag);
                                }

                            }.bind(this));

                        }.bind(this));

                    }.bind(this));

                    break;

                case 'dir':

                    var id = this.treeParam.idEnd;
                    var pathSelected = param.tree.cachePaths[id];

                    title = lang.confirm.deleteFolder;
                    des = lang.confirm.deleteFolder + pathSelected;

                    zz.window.confirm({title:title, des: des}, function() {

                        var statFs = fs.lstatSync(pathSelected);

                        if (statFs.isFile()) {
                            fs.unlinkSync(pathSelected);
                        }

                        if (statFs.isDirectory()) {

                            this.deleteDirRecursive(pathSelected);
                            this.treeRemoveBranch(id);
                        }

                        //update parent folder
                        var pid = false;//
                        var parentBranch = this.treeParentBranchByIdChild(id);

                        if (parentBranch.parent){
                            pid = parentBranch.parent.id
                            zz.q('#' + pid + ' [data-act="clickReloadDir"]').click();
                        }

                        this.console(pathSelected + lang.confirm.wasDeleted);

                    }.bind(this));
                    break;
            }
        },

        deleteThumbEnd: function (counter, isZipFlag) {

            var counter = counter || 0;

            zz.window.alert({title: lang.deleteEnd, des: lang.deleted + counter, timer: 1200});

            var pathTmp = param.getPathById(this.treeParam.idEnd);
            var s = pathTmp.split(path.sep); //s[1] - tmp, s[2] - tophat.20dkdied029383

            for (var i in param.tmpDirs) {

                if (param.tmpDirs[i].search(s[2]) != -1) {
                    this.zipChanged[i] = true;
                }
            }

            //this.zipChanged[param.tree.cachePaths[tophat.treeParam.idEnd]] = true;
            this.zipChanged[pathTmp] = true;

            //if deleted files is zip, reload parent dir
            if (isZipFlag) {
                zz.q('#' + this.treeParam.idEnd + ' [data-act="clickReloadDir"]').click();
            }

            this.$root.loadingEnd();

            this.console(counter + ' files deleted! ' + (new Date()).toString());

            var idFirstFrame = this.thumbGetFirstIdInFrame('home');
            var thumb = this.thumb.cache.dir[idFirstFrame];

            this.thumbFrameSet(idFirstFrame);
            this.$set(this.thumb, 'showed', thumb.id);

            this.sceneSet(thumb);

            this.console(thumb.name);
            this.size(thumb);

            //clear selected thumbs
            this.$set(this.thumb, 'selected', []);

            //set count files (thumbs)
            this.$set(this.loading.thumb, 'loaded', this.thumb.dir.length);
        },

        deleteThumbById: function (id) {

            //delete from dir
            var items = this.thumb.dir,
                item, index = -1;

            for (var i = 0; i < items.length; i++) {

                item = items[i];

                if (id == item.id) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                this.thumb.dir.splice(index, 1);
            }
        },
    }
};