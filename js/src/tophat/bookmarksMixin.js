
var bookmarksMixin = {

    methods: {

        bookmarksRead: function () {

            var dirPath = path.join(os.homedir(), '.' + param.programName); // /home/username/.tophat/tophat_bookmarks.json
            var filePath = path.join(os.homedir(), '.' + param.programName, param.bookmarksFileName); // /home/username/.tophat/tophat_bookmarks.json

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

                    var bookmarks = JSON.parse(buf.toString());

                    if (!bookmarks) {
                        bookmarks = [];
                    }

                    this.$set(this.$root, 'bookmarks', bookmarks);
                }
            }.bind(this));

        },

        bookmarksWrite: function () {

            var filePath = path.join(os.homedir(), '.' + param.programName, param.bookmarksFileName);

            var bookmarks = JSON.stringify(this.$root.bookmarks);

            fs.writeFile(filePath, bookmarks, function (err) {

                if (err) {
                    throw err;
                }

                this.console(lang.bookmarks.saved);

            }.bind(this));
        },

        clickBookmarkAdd: function () {

            var fullpath = this.$root.fullpath;
            var name = path.parse(fullpath).base;

            zz.window.confirm({title: lang.bookmarks.add, des: lang.bookmarks.add}, function(){

                this.bookmarks.push({name: name, fullpath:fullpath});
                this.bookmarksWrite();
            }.bind(this));
        },

        bookmarkDelete: function (fullpath) {

            if (!fullpath) {
                return;
            }

            zz.window.confirm({title: lang.bookmarks.delete, des: lang.bookmarks.delete + ': ' + fullpath}, function(){

                for (var i = 0; i < this.bookmarks.length; i++) {

                    if (fullpath == this.bookmarks[i].fullpath) {

                        this.bookmarks.splice(i, 1);
                        break;
                    }
                }

                this.bookmarksWrite();

            }.bind(this));
        },

        clickBookmarks: function(e) {

            var t = e.target;
            var fullpath = t.getAttribute('data-fullpath');
            var act = t.getAttribute('data-act');

            if (!act) {
                return;
            }

            if (!fullpath) {
                return;
            }

            switch (act) {

                case 'goto':

                    param.tree.cachePaths = {};
                    param.startApp = true; //for scroll to open dir (bookmark)

                    this.$set(this, 'tree', {});

                    this.$set(this, 'fullpath', fullpath);
                    this.dirFullpathArr(fullpath);

                    Vue.nextTick(function () {
                        this.treeInit(fullpath);
                    }.bind(this));

                    this.thumbLoad(fullpath);

                    this.pathHistory.push(fullpath);

                    this.$set(this, 'treeTabSelected', 'tree');

                    Vue.nextTick(function () {
                        this.treeScrollSelectedIntoView();
                    }.bind(this));
                    break;

                case 'delete':

                    this.bookmarkDelete(fullpath);
                    break;
            }
        },

        clickBookmarksShow: function () {



        }

    }
}