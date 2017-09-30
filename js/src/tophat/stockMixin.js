
var stockMixin = {

    methods: {

        stockCreateFolder: function (nameDir) {

            if (!nameDir) {
                return;
            }

            var selected = this.thumb.selected;

            if (selected.length < 1) {
                this.console('select files!');
                return;
            }

            var dateObj = new Date();
            var month = ('0' + (dateObj.getMonth()+1)).slice(-2); //months from 1-12
            var day = ('0' + dateObj.getUTCDate()).slice(-2)
            var year = dateObj.getFullYear();

            var dateFormat = year + '_' + month + '_' + day;

            var dateName = dateFormat + '_' + nameDir;

            var newPathDir = path.join(os.homedir(), 'batches', dateName);

            //create new dir
            fs.mkdirSync(newPathDir);

            var total = selected.length;
            var counter = 0;

            //move every file to created folder
            selected.forEach(function (id) {

                var thumb = this.getThumbById(id);

                var oldPath = thumb.path;
                var newPath = path.join(newPathDir, thumb.name);

                fs.rename(oldPath, newPath, function (err) {

                    if (err) {
                        throw err;
                    }

                    this.deleteThumbById(id);
                    ++counter;

                    //at the end
                    if (counter >= total) {

                        //after files moved
                        this.deleteThumbEnd(counter);
                    }

                }.bind(this));

            }.bind(this));

        },

        stockEps10: function (fullpath) {

            var eps10 = [];
            var binary = [];
            var badname = [];
            var REF = [];
            var txtFileIs = false;

            function decode(content) {         //var iconv = new Iconv('CP1255', 'UTF-8//TRANSLIT//IGNORE');         //var buffer = iconv.convert(content);

                var buffer = iconv.encode(content, 'win1255');

                return buffer.toString('utf8');
            };

            function Find(filepath, data) {

                if (data.search(/Creator\:\sAdobe\sIllustrator\(R\)\s10\.0/) == -1) {
                    eps10.push(filepath);
                }

                if (data.search(/[a-zA-Z0-9_\-.,]+/img) == -1) {
                    badname.push(filepath);
                }

                if (data.search(/filePath/) != -1) {
                    REF.push(filepath);
                }

                if (data.search(/BeginBinary/) != -1) {
                    binary.push(filepath);
                }
            };

            var walkSync = function (dir, filelist) {

                if (dir[dir.length - 1] != '/') {
                    dir = dir.concat('/');
                }

                var fs = fs || require('fs'),
                    files = fs.readdirSync(dir);

                files.forEach(function (file) {

                    if (file.search(/\.eps$/) != -1) {

                        var filepath = dir + file;
                        var data = decode(fs.readFileSync(filepath));
                        Find(filepath, data);
                    }
                    if (file.search(/\.txt$/) != -1) {
                        txtFileIs = true;
                    }
                });

                return filelist;
            };

            function getFileName(fullpath) {

                return path.parse(fullpath).base;
            }

            walkSync(fullpath);

            var msg = [];

            //binary
            if (binary.length > 0) {

                msg.push('<b>exists binari Objects: </b>');
                msg.push('<br>');
                binary.forEach(function (item) {
                    msg.push(getFileName(item) + '<br>');
                });
            }
            //EPS 10
            if (eps10.length > 0) {
                msg.push('<br>');
                msg.push('<b style="color:red">--------------- ATTENTION! --------------- EPS 10 not found: </b>');
                msg.push('<br>');
                eps10.forEach(function (item) {
                    msg.push(getFileName(item) + '<br>');
                });
            }
            //badname
            if (badname.length > 0) {
                msg.push('<br>');
                msg.push('Bad name (cyrillic character): ');
                msg.push('<br>');
                badname.forEach(function (item) {
                    msg.push(getFileName(item) + '<br>');
                });
            }
            //ref
            if (REF.length > 0) {
                msg.push('<br>');
                msg.push('<b style="color:red">--------------- ATTENTION! --------------- Link exist: </b>');
                msg.push('<br>');
                REF.forEach(function (item) {
                    msg.push(getFileName(item) + '<br>');
                });
            }

            if (msg.length < 1) {
                msg.push("ok!");
            }

            var des = msg.join('');

            zz.window.alert({title: "Ready for stock", des: des, classWindow: "zz-window__alert-ready-for-stock"}, function(){

            });

            if (!txtFileIs) {

                function createTxtFile() {

                    var name = 'stock.txt',
                        filepath;

                    var id = app.treeParam.idEnd;
                    var pathSelected = param.tree.cachePaths[id];
                    filepath = path.join(pathSelected, name);
                    var fs = fs || require('fs')
                    fs.closeSync(fs.openSync(filepath, 'w'));
                };
                createTxtFile();
            }
        }

    }
}