
var treeMixin = {

    methods: {

        treeInit: function (pathDir) {

            var pathDir = pathDir || __startDir;
            var pathArr = pathDir.split(param.pathSeparator);
            pathArr[0] = '/';

            var listArr = []; //{[list], [list]}

            pathArr.forEach(function (dirname, index) {

                var pathItem;
                if (0 == index) {
                    pathItem = '/';
                }
                else {

                    pathItem = path.normalize(pathArr.slice(0, (index + 1)).join(path.sep));
                }

                var list = fs.readdirSync(pathItem).filter(function (file) {

                    var isDir = false;
                    if (file.search(/\.zip$/) != -1) {
                        return true;
                    }
                    if (file.search(/\.rar$/) != -1) {
                        return true;
                    }

                    if (file.search(/^\./) == -1) {

                        if (fs.existsSync(path.join(pathItem, file))) {

                            var stats = fs.statSync(path.join(pathItem, file));
                            if (stats) {
                                isDir = stats.isDirectory();
                            }
                        }

                        return isDir;
                    }
                });

                if (list.length > 0) {
                    listArr.push(list);
                }
            });

            //build tree
            this.$set(this, 'tree', this.treeBuilder(pathDir, pathArr, listArr));

        },

        treeBuilder: function (pathDir, pathArr, listArr) {

            if (!pathArr || !pathArr) {
                return;
            }

            var index = 0, tree;
            var that = this;

            pathArr.shift(); //delete / root dir

            //children list {name},{name, children},{name},{name}

            function treeChildrenParse() {

                var childrenList = listArr[index];
                var childNameForCompare = pathArr[index];
                var children = [], childName, id;
                var indexCached = index,
                    ext = false, isFolder = false, size = false;

                for (var i = 0; i < childrenList.length; i++) {

                    childName = childrenList[i];
                    id = zz.id('tree');
                    ext = false;
                    size = false;

                    if (['.zip','.rar'].includes(path.parse(childName).ext)) {
                        ext = 'zip';
                        isFolder = false;

                        size = that.getFileSizeSync(path.normalize(path.sep + pathArr.slice(0, indexCached).join(path.sep) + path.sep + childName)).sizeFormatted;
                    }

                    if (childNameForCompare == childName) {

                        if (index < (listArr.length - 1)) {

                            ++index;

                            children.push({
                                name: childName,
                                children: treeChildrenParse(),
                                openFolder: true,
                                id: id,
                                isFolder: isFolder,
                                ext: ext,
                                size: size
                            });
                        }
                        else {
                            //end point of parse
                            children.push({name: childName, id: id, isFolder: isFolder, ext: ext, size: size});
                        }
                    }
                    else {
                        //bottom of branch
                        children.push({name: childName, id: id, isFolder: isFolder, ext: ext, size: size});
                    }

                    param.tree.cachePaths[id] = path.normalize(path.sep + pathArr.slice(0, indexCached).join(path.sep) + path.sep + childName);
                }

                function comp (a , b) {
                    var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    return collator.compare(a.name, b.name);
                }

                children.sort(comp);

                return children;
            }

            tree = {name: '/ [root]', children: treeChildrenParse(), openFolder: true, id: 'treeRoot', isFolder: true};

            param.tree.cachePaths['treeRoot'] = '/';

            var paramPaths = param.tree.cachePaths;

            var startPath = pathDir || __startDir;

            if (__startPath) {
                if (__startPath.search(/\.zip$/) != -1){

                    startPath = __startPath;
                }
            }

            var idEnd = 0;
            for (var i in paramPaths) {
                if (paramPaths[i] == startPath) {
                    idEnd = i;
                    this.treeSelect(i);
                    break;
                }
            }

            //scroll thumbnail when start app
            if (param.startApp) {
                param.startApp = false;

                Vue.nextTick(function () {

                    this.treeScrollSelectedIntoView();

                    //var el = zz.q('#' + this.treeParam.idEnd + ' [data-act="clickDirName"]');
                    //if (el) {
                    //    //el.click();
                    //}
                }.bind(this));

            }

            return tree;
        },

        /**
         * @des scroll selected dir into view
         */
        treeScrollSelectedIntoView: function () {

            var el = document.querySelector('#' + this.treeParam.idEnd + '');
            if (el) {
                el.scrollIntoView();
                document.querySelector('#block-tree').scrollTop -= 40;
            }
        },

        treeBranch: function (id) {

            if (!id) {
                return;
            }

            var pathDir = param.tree.cachePaths[id];
            var dirType = zz.getExtFromPath(pathDir);

            if (['zip','rar'].includes(dirType)) {

                pathDir = param.tmpDirs[pathDir];
            }

            //get list inserted dirs
            var list = fs.readdirSync(pathDir).filter(function (file) {

                var isDir = false;
                //if zip return true
                if (['.zip','.rar'].includes(path.parse(file).ext)) {
                    isDir = true;
                    return isDir;
                }

                if (file.search(/^\./) == -1) {

                    if (fs.existsSync(path.join(pathDir, file))) {

                        var stats = fs.statSync(path.join(pathDir, file));
                        if (stats) {
                            isDir = stats.isDirectory();
                        }
                    }
                    return isDir;
                }
            });

            if (list.length < 1) {
                return;
            }

            var branchChildren = [];

            //create objects from list
            list.forEach(function (dirName) {

                var id = zz.id('tree');
                var ext;
                var pathToFile = path.normalize(path.join(pathDir, dirName));

                var children = {name: dirName, id: id};

                if (['.zip','.rar'].includes(path.parse(dirName).ext)) {
                    ext = path.parse(dirName).ext.replace(/\./, '');
                    children.ext = ext;
                    children.size = this.getFileSizeSync(pathToFile).sizeFormatted;
                }

                param.tree.cachePaths[id] = pathToFile;

                branchChildren.push(children);
            }.bind(this));

            return branchChildren;
        },

        treeBranchById: function (treeId) {

            //find branch recursive over tree
            function find (branch) {

                //fb fined branch
                var fb;

                if (treeId == branch.id) {

                    return branch;
                }
                else {

                    if (branch.children) {

                        if (branch.children.length > 0) {

                            for (var i=0;i<branch.children.length;i++) {

                                fb = find(branch.children[i]);
                                if (fb) {
                                    return fb;
                                }
                            }
                        }
                    }
                }
                return false;
            }

            return find(this.tree);
        },

        treeParentBranchByIdChild: function (treeId) {

            var branchFound = {};
            //find branch recursive over tree
            function find (branch) {

                //fb fined branch
                var fb;

                if (treeId == branch.id) {

                    return branch;
                }
                else {

                    if (branch.children) {

                        if (branch.children.length > 0) {

                            for (var i=0;i<branch.children.length;i++) {

                                fb = find(branch.children[i]);
                                if (fb) {

                                    branchFound = {parent: branch, index: i};
                                }
                            }
                        }
                    }
                }
                return false;
            }

            find(this.tree);
            return branchFound;
        },

        treeSelect: function (id) {

            this.treeParam.idEnd = id;
        },

        /**
         * @des found and remove children branch by index
         * @param id
         */
        treeRemoveBranch: function (id) {

            //found {parent:, index:}
            var branchObj = this.treeParentBranchByIdChild(id);

            //remove children branch
            branchObj.parent.children.splice(branchObj.index, 1);
            param.removePathById(id);
        },

        /**
         * @des click next dir in list
         * @param id
         */
        treeAddChild: function (child, fullpath) {

            //Vue.set(this.tree.children, '', child);
            /**
             *
             {
                 ext:false
                 id:"tree1"
                 isFolder:false
                 name:"bin"
                 size:false
             }
             */

            if (!child) {
                return;
            }

            var branchObj = this.treeParentBranchByIdChild(this.treeParam.idEnd);
            //console.log(branchObj);
            if (branchObj.parent.children) {
            //
                child.id = 'tree' + parseInt(this.tree.children[this.tree.children.length - 1].id.replace(/tree/, ''), 10) + 1;
                branchObj.parent.children.push(child);
                if (fullpath) {
                    param.tree.cachePaths[child.id] = fullpath;
                }
            }
        },

        /**
         * @des check is zip folder
         * @param idTree
         * @returns {boolean}
         */
        treeIsZip: function (idTree) {

            if ('treeRoot' == idTree) {
                return false;
            }

            var branchParent = this.treeParentBranchByIdChild(idTree);

            if ('zip' == branchParent.parent.ext) {

               return branchParent.parent.id;
            }
            else {

                return this.treeIsZip(branchParent.parent.id);
            }
        },

        /**
         * @des click next dir in list
         * 1. if in zip inserted one dir
         * 2. if in zip inserted one dir an it dir has children, go to children[0]: dir or zip
         * 3. if in zip inserted list of dirs, go to next(prev) dir
         * 4. if in zip inserted list of files
         * @param id
         */
        treeDirGo: function(arrow) {

            var idTreeSelected = this.treeParam.idEnd;
            var branchParent = this.treeParentBranchByIdChild(idTreeSelected);
            var branch = this.treeBranchById(idTreeSelected);
            var list = branchParent.parent.children;
            var nextDir = false;

            var isZip = this.treeIsZip(idTreeSelected); //(branchParent.parent.ext == 'zip') ? true : false;
            var isChildrenDir = branch.children ? (branch.children.length ? true : false) : false;

            var idNext, el, tmpDir;

            //[2] if is children
            if (isChildrenDir) {
                list = branch.children;
                nextDir = list[0];
                idNext = nextDir.id;

                //if next(first children) is zip
                var branch = this.treeBranchById(idNext);
                if (['zip','rar'].includes(branch.ext)) {
                    isZip = branch.id;
                }

                if (isZip) {

                    el = zz.q('#' + idNext + ' [data-act="clickUnzip"]');

                    if (!el) {
                        //zip without inserted dirs, load from cache thumbs
                        tmpDir = param.tmpDirs[param.tree.cachePaths[idNext]];
                        this.thumbLoad(tmpDir);
                        el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                    }
                }
                else {
                    el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                }

                //el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                el.click();
                //this.$root.flag.closeUnpackTail = false;
                return;
            }

            //[3] list of dirs, go to next dir
            if (list) {

                for (var i=0;i<list.length;i++) {

                    if (idTreeSelected == list[i].id) {
                        if ('next' == arrow) {
                            if (list[i+1]) {
                                nextDir = list[i+1];
                            }
                        }
                        break;
                    }
                }

                /**
                 * Если текущая директория последняя в ветке (списке)
                 * то ищем следующий файл или папку в списке
                */
                if (false == nextDir) {

                    var branchParentParent = this.treeParentBranchByIdChild(branchParent.parent.id);

                    if (branchParentParent.parent.children) {

                        list = branchParentParent.parent.children;

                        for (var i=0;i<list.length;i++) {

                            if (branchParent.parent.id == list[i].id) {
                                if ('next' == arrow) {
                                    if (list[i+1]) {
                                        nextDir = list[i+1];
                                    }
                                }
                                break;
                            }
                        }
                        if (!nextDir) {
                            return;
                        }

                        idNext = nextDir.id;

                        // /**
                        //  * Если родительская директория - zip,
                        //  * закрываем zip файл
                        //  * и ищем следующий файл или папку в списке
                        //  */
                        // if ('zip' == branchParent.parent.ext) {
                        //     //branchParent.parent.children
                        //
                        //     this.closeUnpackTail();
                        // }

                        el = zz.q('#' + idNext + ' [data-act="clickUnzip"]');

                        if (!el) {
                            //zip without inserted dirs, load from cache thumbs
                            tmpDir = param.tmpDirs[param.tree.cachePaths[idNext]];
                            this.thumbLoad(tmpDir);
                            el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                        }

                        if (el) {
                            el.click();
                        }
                    }
                }
                else {

                    idNext = nextDir.id;

                    el = zz.q('#' + idNext + ' [data-act="clickUnzip"]');

                    if (!el) {
                        //zip without inserted dirs, load from cache thumbs
                        tmpDir = param.tmpDirs[param.tree.cachePaths[idNext]];
                        this.thumbLoad(tmpDir);
                        el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                    }

                    if (el) {
                        el.click();
                    }
                }
                return;
            }

            for (var i=0;i<list.length;i++) {

                if (idTreeSelected == list[i].id) {
                    if ('next' == arrow) {
                        if (list[i+1]) {
                            nextDir = list[i+1];
                        }
                    }
                    else if ('prev' == arrow) {
                        if (list[i-1]) {
                            nextDir = list[i-1];
                        }
                    }
                    break;
                }
            }
            //nextDirId = nextDir.id;
            //nextDirName = nextDir.name;

            if (isZip) {

                idTreeSelected = branchParent.parent.id;
                branchParent = this.treeParentBranchByIdChild(idTreeSelected);
                list = branchParent.parent.children;
            }

            if (nextDir) {

                idNext = nextDir.id;
                if (['zip','rar'].includes(nextDir.ext)) {
                    isZip = true;
                }

                //zip inserted dir         file.zip->dir[0]
                if ((['zip','rar'].includes(nextDir.ext)) && nextDir.children){
                    if (nextDir.children.length > 0) {
                        idNext = nextDir.children[0].id;
                    }
                    else {
                        idNext = nextDir.id;
                    }
                }


                //
                //console.log(idNext, isZip, 'idNext, isZip')

                /**
                 * if there is zip file, then unpack it by click on arch icon
                 */
                if (isZip) {

                    el = zz.q('#' + idNext + ' [data-act="clickUnzip"]');

                    if (!el) {
                        //zip without inserted dirs, load from cache thumbs
                        tmpDir = param.tmpDirs[param.tree.cachePaths[idNext]];
                        this.thumbLoad(tmpDir);
                        el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                    }
                }
                else {
                    el = zz.q('#' + idNext + ' [data-act="clickDirName"]');
                }

                if (el) {
                    el.click();
                }
            }
        },

        /**
         * @des Close unpack archives and click close tree icon
         */
        closeTail: function () {

            var dirs = Object.assign({}, param.tmpDirs),
                dir;

            param.tmpDirs = {}; //clear tmp

            var tmpId;
            var elTreeBranch;

            for (var i in dirs) {

                dir = dirs[i];

                tmpId = param.getIdByPath(i);

                elTreeBranch = zz.q('#' + tmpId + ' [data-act="close"]');

                if (elTreeBranch) {
                    elTreeBranch.click();
                }

                this.deleteDirRecursive(dir);
            }
        },



        // closeUnpackTail: function () {
        //     // remove tmp dirs if flag is true
        //     if (this.$root.flag.closeUnpackTail === true) {
        //
        //         var dirs = Object.assign({}, param.tmpDirs),
        //             dir;
        //
        //         param.tmpDirs = {}; //clear tmp
        //
        //         var tmpId;
        //         var elTreeBranch;
        //
        //         for (var i in dirs) {
        //
        //             dir = dirs[i];
        //
        //             tmpId = param.getIdByPath(i);
        //
        //             elTreeBranch = zz.q('#' + tmpId + ' [data-act="close"]');
        //
        //             if (elTreeBranch) {
        //                 elTreeBranch.click();
        //             }
        //
        //             this.deleteDirRecursive(dir);
        //         }
        //     }
        // },



        /**
         * @des fast moving to dir throw fullpath
         * @param dirName
         */
        clickTreeFullpathJump: function (e) {

            var fullpath, treeId, branch;
            var type = e.target.getAttribute('data-type');

            if ('path' != type) {
                return;
            }

            fullpath = e.target.getAttribute('data-path');
            treeId = param.getIdByPath(fullpath);

            if (!treeId) {
                return;
            }

            branch = this.treeBranchById(treeId);
            for (var i=0;i<branch.children.length;i++){
                branch.children[i].children = [];
            }
            this.treeSelect(treeId);
            this.$set(this, 'fullpath', fullpath);
            this.dirFullpathArr(fullpath);

            Vue.nextTick(function(){
                this.treeScrollSelectedIntoView();
            }.bind(this));
        },

        treeJumpToDir: function (dir) {

            param.tree.cachePaths = {};
            param.startApp = true; //for scroll to open dir (bookmark)

            this.$set(this, 'tree', {});

            this.$set(this, 'dir', dir);
            this.dirFullpathArr(dir);

            Vue.nextTick(function () {
                this.treeInit(dir);
            }.bind(this));

            this.thumbLoad(dir);

            this.pathHistory.push(dir);
        },

    }
};