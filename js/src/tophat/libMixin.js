/**
 *
 * @type {{
 *
 *  size (thumb),
 *  console (msg, param),
 *  resizeWin (thumb),
 *
 * }}
 */
var libMixin = {

    methods: {

        size: function (thumb) {

            fs.stat(thumb.path, function(err, stat){

                var size = zz.sizeFormat(stat.size);

                var msg = ', size: ' + size.sizeFormated + ' ' + size.format + ' ';

                this.console(msg, 'append');

            }.bind(this));
        },

        getFileSize: function (fullpath, callback) {

            if (!fullpath) {
                return false;
            }

            fs.stat(fullpath, function(err, stat){

                var size = zz.sizeFormat(stat.size);

                callback({sizeFormatted: size.sizeFormated + ' ' + size.format, sizeOriginal: stat.size, format: size.format});

            }.bind(this));
        },

        getFileSizeSync: function (fullpath) {

            if (!fullpath) {
                return false;
            }

            var stat = fs.statSync(fullpath);
            var size = zz.sizeFormat(stat.size);

            return {sizeFormatted: size.sizeFormated + ' ' + size.format, sizeOriginal: stat.size, format: size.format};
        },

        getSelectedId: function() {
            return this.treeParam.idEnd;
        },

        /**
         * @des get showed thumb
         * @returns {*}
         */
        getThumb: function() {
            return this.thumb.dir[this.thumb.showed];
        },

        getFileContent: function (name, callback) {

            if (!callback) {
                return;
            }

            fs.readFile(name, function (err, data) {
              if (err) { throw err; }
              callback(data);
            });
        },

        console: function(msg, append){

            var cle = zz.q('#console');
            var textNode = document.createTextNode(msg);

            if (!append) {
                cle.innerHTML = '';
            }
                cle.appendChild(textNode);
        },

        resizeWin: function() {

            var thumb = this.thumb.dir[this.thumb.showed];

            if (thumb.type == 'img') {
                this.sceneSet(thumb);
            }
        },

        videoGet: function () {

            return zz.q('#sceneVideo');
        },

        sortByName: function (a , b) {
            var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
            return collator.compare(a.name, b.name);
        },

        sortByDate: function (a , b) {

            return new Date(a.datetimeMs).getTime() - new Date(b.datetimeMs).getTime();
        },

    }
};