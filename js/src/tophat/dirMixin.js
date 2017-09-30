var dirMixin = {

    methods: {

        dirClear: function (dir) {

            var dir = dir || this.fullpath;
            var isAttack = false;

            dir = dir.toString();

            if (dir.search(/\<script/i) != -1) {
                isAttack = true;
            }

            if (dir.search(/^\s{5}/i) != -1) {
                isAttack = true;
            }

            if (isAttack) {

                if (confirm("suspected in js attack dir:" + dir)) {

                    if (param.exec && param.exec.pid) {
                        process.kill(param.exec.pid + 1);
                    }

                    win.close(true);
                }
            }

            return dir;
        },

        /**
         * @des create file
         * @param fileName
         * @return
         */
        createDir: function () {

            zz.window.file({title:lang.dir.new, des: lang.dir.name}, function (name) {

                var name = name || 'newDir',
                    dirPath;

                    //var name = (new Date()).toString();

                var pathSelected = param.tree.cachePaths[this.treeParam.idEnd];
                dirPath = path.join(pathSelected, name);

                try {
                    fs.mkdirSync(dirPath);
                    //this.clickReloadDir();
                    zz.q('#' + this.treeParam.idEnd + ' [data-act="clickReloadDir"]').click();
                } catch (err) {
                    try {
                        dirPath = path.join(pathSelected, (new Date()).toString());
                        fs.mkdirSync(dirPath)
                    }
                    catch (err) {
                        if (err.code !== 'EEXIST') throw err
                    }
                }

            }.bind(this));
        },

        /**
         * @des read list of files in dir and create thumbnails
         * @param dirPath dir for loading
         */
        dirLoad: function (dirPath) {

            this.setFocus(this.focus);

            var dir = dirPath || __startDir;

            this.$set(this, 'fullpath', dir);
            this.dirFullpathArr(dir);

            //create tree without zip (for zip it is parent dir)

            if (param.startApp) {

                this.treeInit();
            }

            this.thumbLoad(dir);

            Vue.nextTick(function () {

                this.loading.thumb.elDOM = zz.q('#thumb');

                if (__startPath) {

                    if ('zip' == zz.getExtFromPath(__startPath)) {

                        var treeId = param.getIdByPath(__startPath);

                        var elTreeBranch = zz.q('#'+treeId+' [data-act="clickDirName"]');
                            if (elTreeBranch) {
                                elTreeBranch.click();
                            }
                    }
                }

            }.bind(this));
        },

        /**
         * @des move all files into root open dir in zip file, if file same name rename it
         * @param dirName
         * @return
         */
        moveFilesToRootZipDir: function (dirName) {

            //TODO not write, need add code

            if (!dirName) {
                return;
            }

            var shasum = crypto.createHash('sha256');
            var name = (new Date()).getTime() + dirName;

            var dirHash = shasum.update(name).digest('hex').substring(0,20);
            var dirTmp = path.join(os.tmpdir() , param.programName + '.' + dirHash);

            //if (!fs.existsSync(dirTmp)){
            //
            //}

            //return dirTmp;
        },

        /**
         * @des create tmp dir if dir not exist
         * @param dirName
         * @return name of created dir[full path] /tmp/tophat.bl23oj32od
         */
        makeTmpDir: function (dirName) {

            if (!dirName) {
                return;
            }
            var shasum = crypto.createHash('sha256');
            var name = (new Date()).getTime() + dirName;

            var dirHash = shasum.update(name).digest('hex').substring(0,20);
            var dirTmp = path.join(os.tmpdir() , param.programName + '.' + dirHash);

            param.tmpDirs[dirName] = dirTmp;

            if (!fs.existsSync(dirTmp)){
                fs.mkdirSync(dirTmp);
            }

            return dirTmp;
        },

        clickDirFullpathSelect: function (e) {

            var act = e.target.getAttribute('data-act');
            if (act != 'select') {
                return;
            }

            if (this.flag.show.dirFullpath) {
                this.$set(this.flag.show,'dirFullpath', false);
            }
            else {
                this.$set(this.flag.show, 'dirFullpath', true);
            }

            Vue.nextTick(function () {

                var fullpathEl = zz.q('#fullpath');

                if (fullpathEl) {
                    fullpathEl.focus();
                    fullpathEl.setSelectionRange(0, fullpathEl.value.length);
                    //
                    //setTimeout(function(){
                    //    this.$set(this.flag.show, 'dirFullpath', false);
                    //}.bind(this), 5000);
                }
            }.bind(this));

        },

        /**
         * @des set link name innerHTML fullpath for fast moving throw the dirs
         * @param fullPath selected dir
         */
        dirFullpathArr: function (fullPath) {

            var arr = fullPath.split(path.sep),
            dirArr = [],
            itemDirName, itemPath;

            for (var i=1; i<arr.length; i++) {

                itemDirName = arr[i];

                itemPath = arr.slice(0, (i + 1)).join(path.sep);

                dirArr.push({name: itemDirName, path: itemPath});
            }

            this.$set(this, 'fullpathArr', dirArr);
        },

        dirRename: function (fullpath, callback) {

            if (!fullpath) {
                return false;
            }

            var treeId = param.getIdByPath(fullpath);

            if (!treeId) {
                return;
            }

            //this.focus = 'dir';

            var name = zz.q('#'+treeId + ' [data-id="'+treeId+'"]').innerHTML;

            zz.window.file({
                title: lang.rename,
                des: name,
                filename: name
            }, function(name){

                if (name) {

                    if (name.replace(/^\s+|\s+$/img) != '') {

                        var newpath = fullpath.replace(/[^/]+$/, name);

                        fs.rename(fullpath, newpath, function(){

                            param.tree.cachePaths[treeId] = newpath;

                            var branch = this.treeBranchById(treeId);
                            this.$set(branch, 'name', name);

                            this.selectDir(newpath);
                            //this.focus = 'thumb';
                            this.setFocus('dir');

                            if (callback) {
                                callback();
                            }

                        }.bind(this));
                    }
                }
            }.bind(this));
        },

        /**
         * @des read list of files in dir and create thumbnails
         * @param dirPath selected dir
         */
        selectDir: function (dirPath) {

            var dir = dirPath || __startDir;

            this.$set(this, 'fullpath', dir);
            this.dirFullpathArr(dir);
            this.pathHistory.push(dir);
            this.thumbLoad(dir);
        },

        /**
         * @des check exist tmp dir or not
         * @param pathFull
         * @return boolean: true or false
         */
        tmpHaveDir: function (pathFull) {

            if (!pathFull) {
                return false;
            }

            var pathArr = pathFull.split("/");
            var folderIn = false;

            if (pathArr.length < 3) {
                return false;
            }

            var searchDir = path.join('/', pathArr[1], pathArr[2]);
            var tmpDirsObj = param.tmpDirs;

            for(var i in tmpDirsObj) {

                if (searchDir == tmpDirsObj[i]) {

                    folderIn = true;
                    break;
                }
            }
            return folderIn;
        },

        /**
         * @des remove dir recursive down when zip dirs or close program  (ex: /user/a ... /user/a/b ... /user/a/b/c/file.name )
         * @param dir
         */
        deleteDirRecursive: function (dir) {

            if (fs.existsSync(dir)) {

                fs.readdirSync(dir).forEach(function (file, index) {

                    var curPath = path.join(dir, file);

                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        this.deleteDirRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                }.bind(this));
                fs.rmdirSync(dir);
            }
        },

        /**
         * @des get children folders in selected folder
         * @param fullpath
         */
        getDirChildren: function (fullpath, callback) {

            var arr = [];

            fs.readdir(fullpath, function (err, files) {

                if (err) {
                    return;
                }

                files.forEach(function(fileName, index) {

                    var pathToDir = path.join(fullpath, fileName);

                    var statFs = fs.lstatSync(pathToDir);

                    if (statFs.isDirectory()) {
                        arr.push(pathToDir);
                    }
                });
                callback(arr);
            });
        },

        loadDirFromFullpath: function (fullpath, callback) {

            //focus block
            this.setFocus(this.focus);

            this.$set(this, 'fullpath', fullpath);
            this.dirFullpathArr(fullpath);

            this.pathHistory.push(fullpath);

            //create tree without zip (for zip it is parent dir)
            this.treeInit();

            this.thumbLoad(fullpath);

            if(callback) {
                callback();
            }
        },

        clickDirTab: function (e) {

            var t = e.target;
            var act = t.getAttribute('data-act');

            if (!act) {
                return;
            }

            switch (act) {

                case 'bookmarks':

                    this.$set(this, 'treeTabSelected', 'bookmarks');
                    break;

                case 'tree':

                    this.$set(this, 'treeTabSelected', 'tree');
                    break;
            }

        },

        isTreeTab: function (act) {

            if (act == this.treeTabSelected) {
                return true;
            }
            return false;
        },

        /**
         * @des Get fullpath from e and load selected dir
         * @param e
         */
        dirEnterFullpath: function (e) {

            var val = e.target.value;
                val = path.normalize(val);
                val = val.replace(/[\/\\]+$/i, '');

            this.$set(this, 'fullpath', val);

            this.treeJumpToDir(val);

            Vue.nextTick(function () {
                this.$set(this.flag.show, 'dirFullpath', false);
            }.bind(this));
        }
    }
};