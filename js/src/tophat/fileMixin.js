var fileMixin = {

    methods: {

        /**
         * @des create file
         * @param fileName
         * @return
         */
        createFile: function (name, ext) {

            var name = name || 'key',
                ext = ext || 'txt',
                filepath;

            if (name == 'name') {
                var name = name + (new Date()).getTime();
            }

            name = name + '.' + ext;

            var id = this.treeParam.idEnd;
            var pathSelected = param.tree.cachePaths[id];
            filepath = path.join(pathSelected, name);

            fs.closeSync(fs.openSync(filepath, 'w'));

            this.thumbLoad(this.fullpath);
        },

        clickCreateFile: function (name) {

            zz.window.file({title: lang.file.new, filename: 'name'}, function (name) {
                this.createFile(name);
            }.bind(this));
        },

        saveFile: function () {

            var thumb = this.thumbGetShowed();
            var filePath = thumb.path;
            var fileName = thumb.name;
            var title = '', des = '';

            switch (thumb.type) {

                case 'text':

                    title = lang.file.confirm.save;
                    des = lang.file.confirm.save + ' ' + fileName;
                    zz.window.confirm({title: title, des: des}, function () {

                        var text = zz.q('#sceneText').value;

                        fs.writeFile(filePath, text, function (err) {

                            if (err) {
                                throw err;
                            }
                            this.console(lang.file.saved);
                        }.bind(this));

                    }.bind(this));
                    break;
            }
        },

        copyFile: function (source, target, callback) {

            var cbCalled = false;

            var rd = fs.createReadStream(source);
            rd.on("error", function (err) {
                done(err);
            });
            var wr = fs.createWriteStream(target);
            wr.on("error", function (err) {
                done(err);
            });
            wr.on("close", function (ex) {
                done();
            });
            rd.pipe(wr);

            function done(err) {
                if (!cbCalled) {
                    callback(err);
                    cbCalled = true;
                }
            }
        },

        ls: function (callback, flag, dir) {

            var list = [],
                __dirname = process.cwd(),
                extImgArr = ['jpg', 'jpeg', 'gif', 'png', 'svg'],
                extVideoArr = ['mp4', 'avi', 'ogg', 'mkv', 'divx', 'wmv', 'flv'],
                extAudioArr = ['mp3', 'flac', 'opus', 'wav'],
                extTxtArr = ['txt', 'key', 'js', 'json', 'htm', 'html', 'php', 'xml'], //, 'doc', 'odt', 'epub', 'djvu'
                extAdobeArr = ['ai', 'eps', 'pdf', 'psd'], // Adobe
                i = 0,
                statFs;

            if (dir) {
                __dirname = dir;//__dirname + dir;
            }

            statFs = fs.lstatSync(__dirname);
            if (!statFs.isDirectory()) {
                //console.log('fileMixin ls not dir');
                return;
            }

            fs.readdir(__dirname, function (err, files) {

                if (err) {
                    console.log(err, 'fileMixin ls readdir err');
                    return;
                }

                //if (flag == 'images') {

                files.forEach(function (fileName) {

                    var statFs = fs.lstatSync(__dirname + '/' + fileName);

                    if (!statFs.isFile()) {
                        return;
                    }

                    var ext = fileName.match(/[^.]+$/)[0].toLowerCase();
                    var type = ext;

                    //filter only images
                    if (extImgArr.indexOf(ext) != -1) {
                        type = 'img';
                    }
                    //filter only video
                    if (extVideoArr.indexOf(ext) != -1) {
                        type = 'video';
                    }
                    //filter only audio
                    if (extAudioArr.indexOf(ext) != -1) {
                        type = 'audio';
                    }
                    //filter only images
                    if (extTxtArr.indexOf(ext) != -1) {
                        type = 'text';
                    }
                    //filter only images
                    if (extAdobeArr.indexOf(ext) != -1) {
                        type = 'adobe';
                    }

                    var title = fileName;
                    var len = 24;

                    if (title.length > len) {
                        title = title.replace(/\.[^.]+$/, '').substring(0, len) + '...' + ext;
                    }

                    if (flag == 'images') {
                        if (type != 'img') {
                            return;
                        }
                    }

                    list.push({
                        id: (i++),
                        title: title,
                        name: fileName,
                        datetime: statFs.birthtime,
                        datetimeMs: statFs.birthtimeMs,
                        src: 'file://' + __dirname + '/' + fileName,
                        dir: __dirname,
                        path: __dirname + '/' + fileName,
                        ext: ext,
                        type: type
                    });
                });
                //}
                //else {
                //    list = files;
                //}
                function comp(a, b) {
                    var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    return collator.compare(a.name, b.name);
                }

                list.sort(comp);
                i = 0;
                list.map(function (item) {
                    item.id = (i++);
                });

                callback(list);

            });
        },

        /**
         * @des return to callback list of files in all recursively dirs
         * @param dir
         * @param callback
         */
        fileGetListByDir: function (dir, callback) {

            this.loadingStart(); //start show animation

            //serial loop
            var walk = function (dir, done) {

                var results = [];

                fs.readdir(dir, function (err, list) {

                    if (err) {
                        return done(err);
                    }
                    var i = 0;

                    (function next() {

                        var file = list[i++];

                        if (!file) {
                            return done(null, results);
                        }

                        file = path.join(dir , file);

                        fs.stat(file, function (err, stat) {

                            if (stat && stat.isDirectory()) {
                                walk(file, function (err, res) {
                                    results = results.concat(res);
                                    next();
                                });
                            } else {
                                results.push(file);
                                next();
                            }
                        });
                    })();
                });
            };

            //parallel loop
            //var walk = function (dir, done) {
            //
            //    var results = [];
            //
            //    fs.readdir(dir, function (err, list) {
            //
            //        if (err) {
            //            return done(err);
            //        }
            //
            //        var pending = list.length;
            //
            //        if (!pending) {
            //            return done(null, results);
            //        }
            //
            //        list.forEach(function (file) {
            //
            //            file = path.resolve(dir, file);
            //
            //            fs.stat(file, function (err, stat) {
            //
            //                if (stat && stat.isDirectory()) {
            //
            //                    walk(file, function (err, res) {
            //                        results = results.concat(res);
            //                        if (!--pending) done(null, results);
            //                    });
            //
            //                } else {
            //                    results.push(file);
            //                    if (!--pending) done(null, results);
            //                }
            //            });
            //        });
            //    });
            //};

            walk(dir, function (err, results) {

                if (err) throw err;

                this.loadingEnd(); //stop show animation

                callback(results);
            }.bind(this));
        },

        fileReadToJSON: function (fileName, callback) {

            var dirPath = path.join(os.homedir(), '.' + param.programName); // /home/username/.tophat/tophat_bookmarks.json
            var filePath = path.join(os.homedir(), '.' + param.programName, fileName); // /home/username/.tophat/tophat_bookmarks.json

            if (!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath);
            }

            fs.readFile(filePath, function (err, buf) {

                if (err) {
                    fs.closeSync(fs.openSync(filePath, 'w'));
                    return;
                }

                var str = buf.toString();

                if (str != '') {

                    var json = JSON.parse(buf.toString());

                    callback(json);
                }
            });

        }
    }
};