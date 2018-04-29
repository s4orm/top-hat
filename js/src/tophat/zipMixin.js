var zipMixin = {

    methods: {

        unzipFile: function(obj, callback) {

            if (this.settings.closeTail == true) {
                this.closeTail();
            }

            var obj = obj || {};
            var tmpDir;
            var dirPath = '';

            if (obj.id) {
                dirPath = param.tree.cachePaths[obj.id];
            }
            else if (obj.path) {

            }
            else {
                return;
            }

            if (!param.tmpDirs[dirPath]) {

                tmpDir = this.makeTmpDir(dirPath);
            }
            else {
                //if there is temp dir, then return without creating clone (duplicate) tmp dir
                tmpDir = param.tmpDirs[dirPath];
                this.thumbLoad(tmpDir);
                return;
            }
            //unzip zip file to dir
            this.$set(this.loading, 'unzip', 0);
            this.$set(this.loading, 'unpackingId', param.getIdByPath(dirPath));

            this.$set(this.loading, 'unpackingId', param.getIdByPath(dirPath));

            /**
             * unzipper ->
             */
            //tmpDir dirPath
            var cmdStr = 'unzip "'+dirPath+'" -d "'+tmpDir+'"';

            if (path.parse(dirPath).ext == '.rar') {

                cmdStr = 'unrar e "' + dirPath + '" "' + tmpDir + '"';
            }

            require('child_process').exec(cmdStr, function (error, stdout, stderr) {

                this.$set(this.loading, 'unzip', 100);
                this.$set(this.loading, 'unpackingId', -1);

                var isFile = false;
                var firstDir = false;

                fs.readdir(tmpDir, function (err, files) {

                    if (err) {
                        return;
                    }

                    //looking for files inside dir. If there is files, then load it. If there is not files, then try load first dir in a row
                    files.forEach(function (fileName, index) {

                        var pathInTmpDir = path.join(tmpDir, fileName);
                        var statFs = fs.lstatSync(pathInTmpDir);

                        if (statFs.isDirectory()) {
                            if (0 == index) {
                                firstDir = pathInTmpDir;
                            }
                            return;
                        }
                        else {
                            isFile = true;
                        }
                    });

                    if (isFile) {
                        this.thumbLoad(tmpDir);
                        firstDir = tmpDir;
                    }
                    else if (firstDir) { //try load first dir in a row

                        //this.thumbLoad(firstDir);
                    }
                    else {
                        console.log(tmpDir, 'err');
                    }

                    if (callback) {
                        callback(isFile, firstDir);
                    }
                }.bind(this));

            }.bind(this));

//
//
//             var unzipper = new DecompressZip(dirPath);
//
//             unzipper.on('error', function (err) {
//                 this.console(err);
//             }.bind(this));
//
//             unzipper.on('extract', function (log) {
//
//                 this.$set(this.loading, 'unzip', 100);
//                 this.$set(this.loading, 'unpackingId', -1);
//
//                 var isFile = false;
//                 var firstDir = false;
//
//                 fs.readdir(tmpDir, function (err, files) {
//
//                     if (err) {
//                         return;
//                     }
//
//                     //looking for files inside dir. If there is files, then load it. If there is not files, then try load first dir in a row
//                     files.forEach(function(fileName, index) {
//
//                         var pathInTmpDir = path.join(tmpDir, fileName);
//                         var statFs = fs.lstatSync(pathInTmpDir);
//
//                         if (statFs.isDirectory()) {
//                             if (0 == index) {
//                                 firstDir = pathInTmpDir;
//                             }
//                             return;
//                         }
//                         else {
//                             isFile = true;
//                         }
//                     });
//
//                     if (isFile) {
//                         this.thumbLoad(tmpDir);
//                         firstDir = tmpDir;
//                     }
//                     else if (firstDir) { //try load first dir in a row
//
//                         //this.thumbLoad(firstDir);
//                     }
//                     else {
//                         console.log(tmpDir, 'err');
//                     }
//
//                     if (callback) {
//                         callback(isFile, firstDir);
//                     }
//
//
//                 }.bind(this));
//
//             }.bind(this));
//
//             unzipper.extract({
//                 path: tmpDir,
//                 filter: function (file) {
//
//                     //var iconv = new Iconv('CP1252', 'CP850');//, 'ASCII//TRANSLIT');
//                     //var str = (iconv.convert(file.filename)).toString();
//                     //    iconv = new Iconv('CP850', 'CP866')
// ///
// //                            console.log( file.filename, (iconv.convert(str)).toString() )
//
//                     return file.type !== "SymbolicLink";
//                 }
//             });

            //var Iconv  = require('iconv').Iconv;

            // Decompress(dirPath, tmpDir, {
            //     filter: function(file) { return file.type !== "SymbolicLink"; }
            // }).then(function (files) {
            //
            //
            //     this.$set(this.loading, 'unzip', 100);
            //     this.$set(this.loading, 'unpackingId', -1);
            //
            //     var isFile = false;
            //     var firstDir = false;
            //
            //     fs.readdir(tmpDir, function (err, files) {
            //
            //         if (err) {
            //             return;
            //         }
            //
            //         //looking for files inside dir. If there is files, then load it. If there is not files, then try load first dir in a row
            //         files.forEach(function(fileName, index) {
            //
            //             var pathInTmpDir = path.join(tmpDir, fileName);
            //             var statFs = fs.lstatSync(pathInTmpDir);
            //
            //             if (statFs.isDirectory()) {
            //                 if (0 == index) {
            //                     firstDir = pathInTmpDir;
            //                 }
            //                 return;
            //             }
            //             else {
            //                 isFile = true;
            //             }
            //         });
            //
            //         if (isFile) {
            //             this.thumbLoad(tmpDir);
            //             firstDir = tmpDir;
            //         }
            //         else if (firstDir) { //try load first dir in a row
            //
            //             //this.thumbLoad(firstDir);
            //         }
            //         else {
            //             console.log(tmpDir, 'err');
            //         }
            //
            //         if (callback) {
            //             callback(isFile, firstDir);
            //         }
            //
            //
            //     }.bind(this));
            //
            // }.bind(this));
        },

        /**
         * @des zip selected folder or by tree id
         * @param id
         * @param callback
         */
        zipFolderById: function(id, callback) {

            var id = id || this.treeParam.idEnd;
            var pathSelected = param.tree.cachePaths[id];

            var pathArr = pathSelected.match(/(.+)\/([^/]+$)/); //check '/path../filename'  ["/path../filename", "/path..", "filename"]
            if (pathArr.length != 3) {
                return;
            }

            var fileName = pathArr[2];
            var zipFileName = fileName + '.zip';
            var zipFolder = pathArr[1];
            var zipFilePath = path.join(zipFolder, zipFileName);

            var tmpFolder = this.tmpHaveDir(pathSelected);

            /**
             * zip dir inserted inside tmp
             */
            if (tmpFolder === true) {
                //dir inside tmp unzipped file, ex: /tmp/tophat.ef37e515e05962a565b3/images
                return;
            }
            //console.log('ps:',pathSelected, 'tmp ?:',tmpFolder);

            /**
             * zip dir
             */
            if (['.zip', '.rar'].includes(path.parse(pathSelected).ext)) {
                //over zip file
                //console.log('origzipfile:', pathSelected, ' fileIs:', param.tmpDirs[pathSelected]);

                //1. rename pathSelected
                //2. zip file
                //3. delete renamed

                var focusCache = this.focus;
                this.setFocus('no');

                zz.window.select_btn({
                    btn: [
                        {name:'close'},
                        {name:'repack'}
                    ],
                    title: lang.confirm.zip,
                    des: lang.closeOrRepackQuestion,

                }, function(action) {

                    this.setFocus(focusCache);

                    tmpFolder = param.tmpDirs[pathSelected];

                    //if zip dir not changed, remove tmp dir
                    //if (!this.zipChanged[pathSelected]) {

                    switch (action) {

                        case 'close':

                            //delete tmp folder and return
                            this.deleteDirRecursive(tmpFolder);
                            var dirs = param.tmpDirs,
                                dir;

                            for (var i in dirs) {

                                dir = dirs[i];

                                if (tmpFolder == dir) {
                                    delete dirs[i];
                                }
                            }

                            this.console(', ' + tmpFolder + ' removed ', 'append');
                            this.$set(this.thumb, 'frame', []);
                            this.sceneSet('clear');
                            //return to tree.js file
                            if (callback) {
                                callback();
                            }
                            break;

                        default: //repack
                            //
                            //var title = lang.confirm.rezip;
                            //var des = '<b>'+pathSelected + '</b><br>' + tmpFolder;
                            //
                            //zz.window.confirm({title:title, des: des}, function() {

                                fs.rename(pathSelected, pathSelected + '.tmp', function(){

                                    var output = fs.createWriteStream(pathSelected);
                                    var archive = archiver('zip', {
                                        store: true // Sets the compression method to STORE.
                                    });

                                    output.on('close', function () {

                                        //tmp middle in folder remove, where is file
                                        fs.unlink(pathSelected + '.tmp', function(){

                                            this.console(', tmp middle removed ', 'append');

                                            //tmp folder remove
                                            this.$root.deleteDirRecursive(tmpFolder);

                                            var dirs = param.tmpDirs,
                                                dir;

                                            for (var i in dirs) {

                                                dir = dirs[i];

                                                if (tmpFolder == dir) {
                                                    delete dirs[i];
                                                }
                                            }

                                            this.console(', ' + tmpFolder + ' removed ', 'append');

                                        }.bind(this));

                                        var size = zz.sizeFormat(archive.pointer());
                                        var sizeFormated = size.sizeFormated + ' ' + size.format;
                                        zz.window.alert({
                                            title:lang.archive.zipped,
                                            timer:2000,
                                            des: pathSelected + '<br><b>' + sizeFormated + '</b>'
                                        }, undefined);

                                        this.console(sizeFormated + ', filepath: ' + pathSelected);
                                        this.$set(this.thumb, 'frame', []);

                                        //sizeFormated
                                        var branch = this.treeBranchById(id);
                                        branch.size = sizeFormated;

                                        this.sceneSet('clear');

                                        if (callback) {
                                            callback();
                                        }
                                    }.bind(this));

                                    archive.on('error', function (err) {
                                        this.console('ERR: '+err);
                                        throw err;
                                    }.bind(this));

                                    archive.pipe(output);

                                    // append files from a directory
                                    archive.directory(tmpFolder, '');

                                    archive.finalize();

                                //}.bind(this));

                            }.bind(this));
                    }

                }.bind(this));

                return;
            }
            else {
                //zip selected files
                var title = lang.confirm.zip;
                var des = pathSelected;

                zz.window.confirm({title:title, des: des}, function() {

                    var output = fs.createWriteStream(zipFilePath);
                    var archive = archiver('zip', {
                        store: true // Sets the compression method to STORE.
                    });

                    output.on('close', function () {

                        var size = zz.sizeFormat(archive.pointer());
                        var sizeFormated = size.sizeFormated + ' ' + size.format;
                        zz.window.alert({
                            title: lang.archive.zipped,
                            timer: 5000,
                            des: '<b>' + zipFileName + '</b><br>' + sizeFormated
                        }, undefined);

                        this.console(sizeFormated + ', filepath: ' + zipFilePath);

                        var fullpath = path.normalize(path.join(this.fullpath, '..'));
                            fullpath = path.join(fullpath, zipFileName);
                        this.treeAddChild(
                        {
                            ext:'zip',
                            //id:"tree",
                            isFolder:false,
                            name:zipFileName,
                            size:sizeFormated
                        },
                        fullpath);

                        if (callback) {
                            callback();
                        }

                    }.bind(this));

                    archive.on('error', function (err) {
                        this.console('ERR: '+err);
                        throw err;
                    }.bind(this));

                    archive.pipe(output);
                    // append files from a directory
                    archive.directory(pathSelected, fileName);
                    archive.finalize();

                }.bind(this));
            }
        },

        zipFiles: function () {

            var selected = this.thumb.selected;

            if (!selected) {
                return;
            }

            if (selected.length < 1) {
                return;
            }

            var id = this.treeParam.idEnd;
            var pathSelected = param.tree.cachePaths[id];

            //            /tmp/tophat.ef37e515e05962a565b3/images, /tmp/tophat.ef37e515e05962a565b3, /to_original_path/images.zip
            //            /home/user/images,
            //console.log(pathSelected, param.tmpDir, param.tmpDirOriginalPath);

            var fileName = (this.getThumbById(selected[0])).name.replace(/\.[a-z0-9]+$/, '');

            var zipFileName = fileName + '.zip';
            var zipFolder = pathSelected;
            var zipFilePath = path.join(zipFolder, zipFileName);

            var title = lang.confirm.zip;
            var des = zipFilePath;

            zz.window.confirm({title:title, des: des}, function() {

                var thumb;
                var output = fs.createWriteStream(zipFilePath);
                var archive = archiver('zip', {
                    store: true // Sets the compression method to STORE.
                });

                output.on('close', function () {

                    var size = zz.sizeFormat(archive.pointer());
                    var sizeFormated = size.sizeFormated + ' ' + size.format;

                    zz.window.alert({
                        title:lang.archive.zipped,
                        timer:5000,
                        des: zipFileName + '<br><b>' + sizeFormated + '</b>'
                    }, undefined);

                    this.console(sizeFormated + ', filepath: ' + zipFilePath);

                    //zz.q('#' + this.treeParam.idEnd + ' [data-act="clickReloadDir"]').click();

                }.bind(this));

                archive.on('error', function (err) {
                    this.console('ERR: '+err);
                    throw err;
                }.bind(this));

                archive.pipe(output);
                // append files from a directory
                for (var i = 0; i < selected.length; i++) {
                    thumb = (this.getThumbById(selected[i]));

                    archive.file(thumb.path, {name: thumb.name});
                }

                archive.finalize();

            }.bind(this));
        },

        /**
         *
         * @param param {
         *  filename: str,
         *  files: array,
         *  zipFolder: str (full path where will be new zip file)
         *  }
         * @param callback
         */
        zipFilesWithParam: function (param, callback) {

            var zipFileName = param.filename || 'name' + (new Date()).getTime() + '.zip';
            var files = param.files || [];
            var zipFolder = param.zipFolder || ''; //

            var file;

            if ('' == zipFolder) {
                //TODO alert
                return;
            }

            if (files.length < 1) {
                //TODO alert need files
                return;
            }
            //TODO check file exist
            //if (!filenameZip) {
            //    //TODO alert need new file name
            //    return;
            //}

            var zipFilePath = path.join(zipFolder, zipFileName);

            var output = fs.createWriteStream(zipFilePath);
            var archive = archiver('zip', {
                store: true // Sets the compression method to STORE.
            });

            output.on('close', function () {

                var size = zz.sizeFormat(archive.pointer());
                var sizeFormated = size.sizeFormated + ' ' + size.format;

                zz.window.alert({
                    title:lang.archive.zipped,
                    timer:5000,
                    des: zipFileName + '<br><b>' + sizeFormated + '</b>'
                }, undefined);

                this.console(sizeFormated + ', filepath: ' + zipFilePath);

            }.bind(this));

            archive.on('error', function (err) {
                this.console('ERR: '+err);
                throw err;
            }.bind(this));

            archive.pipe(output);
            // append files from a directory

            for (var i = 0; i < files.length; i++) {
                file = files[i];
                archive.file(file.path, {name: file.name});
            }

            archive.finalize();

        },

        clickZip: function () {
            if (this.thumb.selected.length > 0) {
                this.zipFiles();
            }
            else {
                this.zipFolderById();
            }
        },

        /**
         * @des zip selected files in separate archive inside parent folder
         */
        clickZipCutOne: function () {

            var focusCache = this.focus;
            this.clickFocus('none');

            zz.window.file({title:lang.file.new, des:lang.file.new, filename: 'name'}, function (filename) {

                var pathSelectedTmpFullpath, pathSelectedTmpFolder, pathSelected, pathParsed, pathOriginalFolder;
                var files = [];

                pathSelectedTmpFullpath = param.tree.cachePaths[this.treeParam.idEnd];

                pathParsed = path.parse(pathSelectedTmpFullpath);

                if ('.zip' == pathParsed.ext) {
                    pathOriginalFolder = pathParsed.dir;
                }
                else {
                    pathSelectedTmpFolder = param.getTmpDirFromPath(pathSelectedTmpFullpath);
                    pathSelected = param.getOribinalPathByTmp(pathSelectedTmpFolder);
                    pathOriginalFolder = path.parse(pathSelected).dir;
                }

                filename = filename + '.zip';

                this.thumb.selected.forEach(function (id) {

                    var thumb = this.getThumbById(id);

                    files.push({path:thumb.path, name: thumb.name}); //filepath

                }.bind(this));

                this.zipFilesWithParam({
                    filename: filename,
                    files: files,
                    zipFolder: pathOriginalFolder
                }, function (answer) {
                    //TODO need renew tree folder
                    this.console('zip created');
                });

                //return focus to thumb maybe or scene
                this.setFocus(focusCache);

            }.bind(this));

        },

        /**
         * @des zip archive children folders in separate archives (one folder -> one archive) [only one level inside parent folder]
         * @param id tree id
         */
        clickZipFolders: function (params) {

            var id = id || this.treeParam.idEnd;
            var pathSelected = param.tree.cachePaths[id];
            var params = params || {};
            var dirsFullpathForDeleteArr = [];

            this.getDirChildren(pathSelected, function (dirChildrenArr) {

                var that = this;

                function zipArr() {

                    var itemFullpath = dirChildrenArr.shift();

                    //for delete dirs if checkbox deleteFoldersAfterZip checked
                    dirsFullpathForDeleteArr.push(itemFullpath);
                    //END
                    if (!itemFullpath) {

                        //delete folders if checkbox deleteFoldersAfterZip checked
                        if (params.deleteFoldersAfterZip) {
                            dirsFullpathForDeleteArr.forEach(function(fullpath){
                                if (fullpath) {
                                    that.deleteDirRecursive(fullpath);
                                }
                            });
                        }

                        //end
                        zz.window.alert({
                            title: lang.archive.zipped,
                            timer: 2000,
                            des: '<b>' + lang.archive.zipped + '</b><br>'
                        }, undefined);
                        //TODO update tree dir
                        zz.q('#' + id + ' [data-act="clickReloadDir"]').click();
                        return;
                    }

                    var fileName = path.parse(itemFullpath).base;
                    var zipFileName = fileName + '.zip';
                    var zipFilePath = path.join(pathSelected, zipFileName);

                    var output = fs.createWriteStream(zipFilePath);
                    var archive = archiver('zip', {
                        store: true // Sets the compression method to STORE.
                    });

                    output.on('close', function () {

                        var size = zz.sizeFormat(archive.pointer());
                        var sizeFormated = size.sizeFormated + ' ' + size.format;
                        that.console(sizeFormated + ', filepath: ' + zipFilePath);

                        setTimeout(zipArr, 100);

                    }.bind(that));

                    archive.on('error', function (err) {
                        that.console('ERR: ' + err);
                        throw err;
                    }.bind(that));

                    archive.pipe(output);
                    // append files from a directory
                    archive.directory(itemFullpath, '');
                    archive.finalize();
                }

                /**
                 * zip dir
                 */
                if ('.zip' == path.parse(pathSelected).ext) {
                    //TODO zip folders and move it to parent lavel
                    return;
                }
                else {

                    //local function
                    zipArr();
                }

            }.bind(this));

        }

    }
};