
var thumbMixin = {

    methods: {

        isShowed: function (id) {

            if (id == this.thumb.showed) {
                return true;
            }

            return false;
        },

        isThumbMarked: function (id) {

            if (false === this.thumb.mark) {
                return false;
            }

            if (id == this.thumb.mark) {
                return true;
            }

            return false;
        },

        thumbJumpToIdFrameSet: function (id) {

            var id = id || 0;

            var numInRow = param.thumb.inRow;
            var rows = param.thumb.rows; //rows in frame
            var thumbs = this.thumb.dir;
            var thumbsFrame = this.thumb.frame;
            var row, indexStart;
            var arrVisible = [];
            var offset = numInRow * rows; //count thumb in frame
            var i, counterInFrame = 0;
            var flagInFrame = false;


            //check mark in frame -->
            for (i=0; i<thumbsFrame.length; i++){
                if (id == thumbsFrame[i].id) {
                    flagInFrame = true;
                    break;
                }
            }

            //if mark in frame do nothing
            if (flagInFrame === true) {
                return;
            }
            //check mark in frame <--

            //get i index of thumb in array
            for (i=0; i<thumbs.length; i++){
                if (id == thumbs[i].id) {
                    break;
                }
            }

            row = Math.floor(i/numInRow);

            if (row == 0) {
                indexStart = 0;
            }
            else {
                indexStart = row * numInRow;
            }

            for (i = indexStart; i < thumbs.length; i++) {

                if (counterInFrame >= offset) {
                    break;
                }
                arrVisible.push(thumbs[i]);
                counterInFrame++;
            }

            this.$set(this.thumb, 'frame', arrVisible);

            Vue.nextTick(function () {

                arrVisible.forEach(function (item) {

                    thumbFromData(item.id, this.thumb.imgCache[item.id], function () {

                    });

                }.bind(this));

            }.bind(this));
        },

        thumbFrameSet: function (id) {

            var arrVisible = null;
            var id = id || 0;

            //reset frame
            arrVisible = this.thumbGetFrame(id);

            if (!arrVisible) {
                //console.log('there is no elements');
                return false;
            }

            this.$set(this.thumb, 'frame', arrVisible);

            Vue.nextTick(function () {

                arrVisible.forEach(function (item) {

                    thumbFromData(item.id, this.thumb.imgCache[item.id], function () {

                    });

                }.bind(this));
            }.bind(this));
        },

        /**
         * @des compute array of indexes in frame
         * @param index
         */
        thumbGetFrame: function (id) {

            var id = id || 0;
            var count = Math.floor(param.thumb.inRow * param.thumb.rows);
            var c = count;
            var arrVisible = [];
            var flag = false;

            for (var i=0; i < this.thumb.dir.length; i++){

                if (id == this.thumb.dir[i].id) {

                    flag = true;
                    arrVisible.push(this.thumb.dir[i]);
                    c--;
                }
                else if (flag) {

                    if (c > 0) {

                        arrVisible.push(this.thumb.dir[i]);
                        c--;
                    }
                    else {
                        break;
                    }
                }
            }

            return arrVisible;
        },

        computeFirstFrame: function(){

            var numInRow = param.thumb.inRow;
            var rows = param.thumb.rows; //rows in frame
            var thumbs = this.thumb.dir;
            var thumb;
            var arrVisible = [];
            var id = this.thumb.dir[0].id;

            var offset = numInRow * rows; //count thumb in frame
            var offsetCount = 0;

            for(var i=0; i < thumbs.length; i++) {

                thumb = thumbs[i];

                if (id == thumb.id) {
                    //start select
                    offsetCount = 1;
                }

                if (offsetCount > 0) {

                    arrVisible.push(thumb);

                    offsetCount++;
                }

                if (offsetCount > offset) {
                    break;
                }
            }

            return arrVisible;
        },

        /**
         * @des 1. get direction and start index this.thumb.frame[0].id
         * @param id
         * @returns {Array}
         */

        thumbGetFromStartIndex: function(id) {

            var numInRow = param.thumb.inRow;
            var rows = param.thumb.rows; //rows in frame
            var thumbs = this.thumb.dir;
            var thumb;
            var arrVisible = [];
            var startFrameId = 0;
            var newStartFrame;
            var newStartFrameId = 0;

            var offset = numInRow * rows; //count thumb in frame
            var offsetLastFrame = 0; //count thumb in frame
            var offsetCount = 0;
            var thumbCount = 0; //when walk up row or step

            //count thumb > frame
            if (this.thumb.dir.length > offset) {

                ////last go to End key
                if (id == this.thumb.dir[(this.thumb.dir.length - 1)].id) {

                    //compute last frame

                    var thumbInRow = param.thumb.inRow;

                    //hack for get nums thumbs in last row (decrement rows except last row)
                    for (var i = this.thumb.dir.length; i > thumbInRow; i -= thumbInRow) {
                        //get last row thumbs num; 4, 3, 2 or 1
                    }
                    var lastRowNum = i;

                    offsetLastFrame = (numInRow * (rows - 1)) + lastRowNum;

                    for (i = (this.thumb.dir.length - 1); i >= 0; i--) {

                        if (offsetCount >= offsetLastFrame) {
                            return arrVisible;
                            break;
                        }

                        thumb = thumbs[i];
                        arrVisible.unshift(thumb)
                        offsetCount += 1;
                    }
                }

                //first go Home key
                if (id == this.thumb.dir[0].id) {

                }
                else if (this.thumb.frame.length) {

                    startFrameId = this.thumb.frame[0].id;

                    //walk down + row
                    if (id > startFrameId) { //TODO check thumb.id after sort

                        newStartFrame = this.thumb.frame[numInRow];

                        if (newStartFrame) {
                            id = newStartFrame.id;
                        }
                    }
                    else {

                        //walk up + row
                        for (i = (this.thumb.dir.length - 1); i >= 0; i--) {

                            //stop because first thumb
                            if (i == 0) {
                                newStartFrameId = 0;
                                break;
                            }

                            if (thumbCount > 0) {
                                //walk up
                                if (thumbCount <= numInRow) {
                                    thumbCount += 1;
                                }

                                //stop thumb found 1row up
                                if (thumbCount > numInRow) {
                                    newStartFrameId = this.thumb.dir[i].id;

                                    break;
                                }
                            }

                            //start walk up
                            if (startFrameId == this.thumb.dir[i].id) {
                                thumbCount += 1;
                            }
                        }
                        id = newStartFrameId;
                    }
                }

            }

            for(var i=0; i < thumbs.length; i++) {

                thumb = thumbs[i];

                if (id == thumb.id) {
                    //start select
                    offsetCount = 1;
                }

                if (offsetCount > 0) {

                    arrVisible.push(thumb);

                    offsetCount++;
                }

                if (offsetCount > offset) {
                    break;
                }
            }

            return arrVisible;
        },

        thumbInFrame: function (id) {

            var inFrame = false;
            var thumb;

            for (var i=0; i<this.thumb.frame.length; i++) {
                thumb = this.thumb.frame[i];
                if (id == thumb.id) {
                    inFrame = true;
                }
            }

            return inFrame;
        },

        /**
         * @des
         * @param act
         * @returns (id or false) first id in next frame or false if do nothing
         */
        thumbGetFirstIdInFrame: function (act) {

            var idRow = this.thumb.cache.idRow;
            var rows = this.thumb.cache.rows;
            var rowsTotalCount = param.thumb.rows;

            var rowNum; //= idRow[id]; // number of row where selected id
            var row;                //var row = rows[rowNum]; // row [4, 5, 8, 19] array
            var idFirst;
            var lastInFrame;

            var newFirstRowNum;

            switch (act) {

                case 'prev':

                    rowNum = idRow[this.thumb.frame[0].id];

                    newFirstRowNum = rowNum - 1;

                    if (newFirstRowNum < 1) {
                        newFirstRowNum = rowNum;
                    }

                    row = rows[newFirstRowNum];

                    break;

                case 'next':

                    var totalThumbs = param.thumb.rows * param.thumb.inRow;
                    if (this.thumb.frame.length < totalThumbs) {
                        return false;
                    }

                    lastInFrame = this.thumb.frame.length - 1;

                    rowNum = idRow[this.thumb.frame[lastInFrame].id];

                    newFirstRowNum = rowNum + 1 - rowsTotalCount + 1; //rowNum + 1 - rowsTotalCount + 1;

                    //if rowNum was last row
                    if (!rows[newFirstRowNum]) {
                        return false;
                    }
                    row = rows[newFirstRowNum];

                    break;

                case 'home':

                    row = rows[1];

                    break;

                case 'end':

                    newFirstRowNum = rows.length - rowsTotalCount;

                    if (!rows[newFirstRowNum]) {
                        row = rows[1];
                    }
                    else {
                        row = rows[newFirstRowNum];
                    }
                    break;
            }

            idFirst = row[0]; //ex: row[4, 5, 6, 7] -> row[0]: 4

            return idFirst;
        },

        //computeCacheIds: function () {
        //
        //    var cache = {};
        //    var id;
        //
        //    for (var i=0;i<this.thumb.dir.length;i++) {
        //        id = this.thumb.dir[i].id;
        //        cache[id] = thumbGetRowNum(i);
        //    }
        //
        //
        //},
        //
        //thumbGetRowNum: function (i) {
        //
        //    //compute without circle for
        //    var inRow = param.thumb.inRow;
        //
        //    var num = Math.floor(i / inRow);
        //
        //    return num + 1;
        //},

        /**
         * @des if order elements changed, need recompile cache
         * this.thumb.cache.idRow: {id: numRow, ... id: numRow }
         * this.thumb.cache.rows: array ( 0: null, 1: [0, 1, 2, 3], 2: [4, 5, 6, 7] ... ) <- for row where 4 thumb in row
         */
        thumbCache: function () {

            var dir = this.thumb.dir;
            var item;
            var i;
            var rowNum = 1;
            var inRow = param.thumb.inRow;
            var inRowCount = 0;

            this.thumb.cache.dir = {};
            this.thumb.cache.idRow = {};
            this.thumb.cache.rows = [null]; //null is in 0 index

            for (i = 0; i < dir.length; i++) {

                if (inRowCount == inRow) {

                    inRowCount = 0;
                    rowNum += 1;
                }

                item = dir[i];

                //this.thumb.cache.idRow
                this.thumb.cache.idRow[item.id] = rowNum; //{id: numRow, ... id: numRow }

                //this.thumb.cache.dir
                this.thumb.cache.dir[item.id] = item; //{id: numRow, ... id: numRow }

                //this.thumb.cache.rows
                if (!this.thumb.cache.rows[rowNum]) {
                    this.thumb.cache.rows[rowNum] = [];
                }

                if (this.thumb.cache.rows[rowNum]) {
                    this.thumb.cache.rows[rowNum].push(item.id); //array ( 0: null, 1: [0, 1, 2, 3], 2: [4, 5, 6, 7] ... )
                }

                inRowCount++;
            }
        },

        /**
         * @des load thumb from dir
         * @param dir
         */
        thumbLoad: function (dir) {

            this.sceneSet('clear');

            this.$set(this.thumb, 'selected', []);
            this.$set(this.thumb, 'frame', []);
            this.$set(this.thumb, 'mark', false);

            this.ls(function (list) {

                this.thumb.threadsLoadingDir.push( 'threadMark-'+(new Date()).getTime() );

                this.$set(this.thumb, 'dir', list);
                this.thumbFrameSet(0);
                this.thumbScrollInit();
                //console name and size
                if (this.thumb.dir[0]) {
                    this.console(this.thumb.dir[0].name);
                    this.size(this.thumb.dir[0]);
                }


                this.$set(this.loading.thumb, 'total', list.length);
                this.$set(this.loading.thumb, 'loaded', 0);
                this.$set(this.loading, 'percent', 0);

                //if thumb > 0
                if (this.thumb.dir.length) {
                    this.thumbSelectById(this.thumb.dir[0].id);
                }

                this.thumbCache();

                var count = 0;

                function setThumb() {

                    if (this.thumb.threadsLoadingDir.length > 1) {
                        list.length = 0;
                        this.thumb.threadsLoadingDir.shift();

                        return;
                    }

                    if (count >= list.length) {

                        this.thumb.threadsLoadingDir.length = 0;

                        if (this.thumb.showed == 0) {
                            this.sceneSet(this.thumb.dir[0]);
                        }
                        return;
                    }

                    var item = list[count];
                    count++;

                    thumb(item, this.thumb.width, this.thumb.height, function (imgData, param) {

                        this.counterThumbnail();

                        if (imgData) {

                            this.thumb.imgCache[item.id] = imgData;

                            if (param) {
                                this.imgCachePreview[item.id] = param.imgData;
                                item.width = param.width;
                                item.height = param.height;
                            }
                        }

                        setTimeout(setThumb.bind(this), 0);

                    }.bind(this));
                }

                setTimeout(setThumb.bind(this), 0);

                this.setFocus('thumb');

            }.bind(this), 'images', dir);
        },


        getThumbById: function (id) {

            var thumbs = this.thumb.dir,
                thumb;
            for (var i = 0; i < thumbs.length; i++) {

                thumb = thumbs[i];

                if (id == thumb.id) {
                    return thumb;
                    break;
                }
            }
        },

        /**
         * @des return selected thumb
         */
        thumbGetShowed: function () {
            return this.getThumbById(this.thumb.showed);
        },

        thumbUnselectAll: function () {

            var thumbs = this.thumb.dir,
                thumb;

            this.thumb.selected = [];

            for (var i = 0; i < thumbs.length; i++) {

                thumb = thumbs[i];
                if (thumb.selectMode) {
                    this.$set(thumb, 'selectMode', false);
                }
            }
        },

        /**
         * @des select all thumbs
         */
        thumbSelectAll: function () {

            var thumbs = this.thumb.dir,
                thumb;

            if (this.thumb.selected.length == this.thumb.dir.length) {
                this.thumbUnselectAll();
                return;
            }

            this.thumb.selected = [];

            for (var i = 0; i < thumbs.length; i++) {

                thumb = thumbs[i];
                this.thumb.selected.push(thumb.id);
                this.$set(thumb, 'selectMode', true);
            }

        },
        /**
         * @des get offset top or summary height of column with bottom inside selected element
         * @param index
         * @returns {number}
         */
        getHeightOfColumn: function(index) {

            var numInRow = param.thumb.inRow;
            var thumbHeight = this.thumb.heightFullLength;
            var selectedItemIndex = index + 1;

            var row = Math.ceil(selectedItemIndex / numInRow); //ceil -> to big size
            var offsetHeight = Math.ceil(thumbHeight * row);

            return offsetHeight;
        },

        thumbSelectById: function (id) {

            var thumbs = this.thumb.dir,
                thumb, thumbShowed;

            for (var i = 0; i < thumbs.length; i++) {

                thumb = thumbs[i];

                if (id == thumb.id) {

                    thumbShowed = thumb;

                    this.$set(this.thumb, 'showed', thumb.id);

                    this.$set(thumb, 'selected', true);
                }
                else {

                    this.$set(thumb, 'selected', false);
                }
            }
            return thumbShowed;
        },

        thumbSelectByIdMode: function (id, rowMode) {

            var thumbs = this.thumb.dir,
                thumb,
                nextThumb = null,
                rowMode = rowMode || false,
                num = 1,
                numInRow = param.thumb.inRow;
                index = 0;

                //
                for (var i = 0; i < thumbs.length; i++) {

                    thumb = thumbs[i];

                    if (rowMode) {

                        nextThumb = null;

                        if (num > numInRow) {

                            break;
                        }
                    }

                    if (id == thumb.id) {

                        if (thumb.selectMode) {

                            var index = this.thumb.selected.indexOf(id);
                            if (index > -1) {
                                this.thumb.selected.splice(index, 1);
                            }

                            this.$set(thumb, 'selectMode', false);
                        }
                        else {

                            this.thumb.selected.push(thumb.id);
                            this.$set(thumb, 'selectMode', true);
                        }

                        if (rowMode) {

                            nextThumb = thumbs[(i + 1)];

                            if (nextThumb) {
                                id = nextThumb.id;
                            }

                            num += 1;
                        }
                    }
                }
            //}
        },

        clickThumb: function (e) {

            var t = e.target;
            var id = zz.find.parentAttr(t, 'data-id');

            if (!id) {
                return;
            }

            this.thumbSelectById(id);
            var thumb = this.getThumbById(id);

            this.sceneSet(thumb);

            this.console(thumb.name);
            this.size(thumb);
        },

        clickThumbSort: function (e) {

            var t = e.target;
            var act = t.getAttribute('data-act');
            var reverse = false;
            var numInRow = param.thumb.inRow;
            var rows = param.thumb.rows; //rows in frame
            var thumbs = this.thumb.dir;
            var arrVisible = [];
            var offset = numInRow * rows; //count thumb in frame
            var i, counterInFrame = 0;


            if (!act) {
                return;
            }

            switch (act) {

                case 'name':

                    if ('increase' == this.thumb.sort.name.to) {
                        thumbs.sort(this.sortByName).reverse();
                        this.$set(this.thumb.sort.name, 'arrow', lang.arrow.up);
                        this.thumb.sort.name.to = 'decrease';
                    }
                    else {
                        thumbs.sort(this.sortByName);
                        this.$set(this.thumb.sort.name, 'arrow', lang.arrow.down);
                        this.thumb.sort.name.to = 'increase';
                    }

                    this.$set(this.thumb.sort.date, 'arrow', '');
                    this.thumb.sort.date.to = 'decrease';

                    this.$set(this.thumb, 'dir', thumbs);

                    break;

                case 'date':

                    if ('increase' == this.thumb.sort.date.to) {
                        thumbs.sort(this.sortByDate).reverse();
                        this.$set(this.thumb.sort.date, 'arrow', lang.arrow.up);
                        this.thumb.sort.date.to = 'decrease';
                    }
                    else {
                        thumbs.sort(this.sortByDate);
                        this.$set(this.thumb.sort.date, 'arrow', lang.arrow.down);
                        this.thumb.sort.date.to = 'increase';
                    }

                    this.$set(this.thumb.sort.name, 'arrow', '');
                    this.thumb.sort.name.to = 'decrease';

                    this.$set(this.thumb, 'dir', thumbs);

                    break;
            }

            this.thumbCache();

            for (i = 0; i < thumbs.length; i++) {

                if (counterInFrame >= offset) {
                    break;
                }
                arrVisible.push(thumbs[i]);
                counterInFrame++;
            }

            this.$set(this.thumb, 'frame', arrVisible);

            Vue.nextTick(function () {

                arrVisible.forEach(function (item) {

                    thumbFromData(item.id, this.thumb.imgCache[item.id], function () {

                    });

                }.bind(this));

            }.bind(this));
        },
        
        /**
         * @des Get next id
         * @param index
         * @param direction
         * @returns {boolean}
         */
        thumbGetIndex: function (index, act) {

            var act = act || 'next';
            var i, num, breakPoint = false,
                secondIndex = false,
                numInRow = param.thumb.inRow;

            switch (act) {

                case 'next':

                    for (i = 0; i < this.thumb.dir.length; i++) {

                        if (breakPoint === false) {
                            if (index == this.thumb.dir[i].id) {
                                breakPoint = true;
                            }
                        }
                        else {
                            secondIndex = this.thumb.dir[i].id;
                            return secondIndex;
                        }
                    }

                    break;

                case 'nextRow':

                    num = 1;
                    for (i = 0; i < this.thumb.dir.length; i++) {

                        if (breakPoint === false) {
                            if (index == this.thumb.dir[i].id) {
                                breakPoint = true;
                                num += 1;
                            }
                        }
                        else {
                            if (num > numInRow) {
                                secondIndex = this.thumb.dir[i].id;
                                return secondIndex;
                            }
                            else {
                                num += 1;
                            }
                        }
                    }

                    break;

                case 'prevRow':

                    num = 1;
                    for (i = (this.thumb.dir.length - 1); i >= 0; i--) {

                        if (breakPoint === false) {
                            if (index == this.thumb.dir[i].id) {
                                breakPoint = true;
                                num += 1;
                            }
                        }
                        else {
                            if (num > numInRow) {
                                secondIndex = this.thumb.dir[i].id;
                                return secondIndex;
                            }
                            else {

                                if (i == 0) {
                                    secondIndex = this.thumb.dir[i].id;
                                    return secondIndex;
                                }
                                num += 1;
                            }
                        }
                    }

                    break;

                case 'prev':

                    for (i = (this.thumb.dir.length - 1); i >= 0; i--) {

                        if (breakPoint === false) {
                            if (index == this.thumb.dir[i].id) {
                                breakPoint = true;
                            }
                        }
                        else {
                            secondIndex = this.thumb.dir[i].id;
                            return secondIndex;
                        }
                    }
                    break;

                case 'home':

                    secondIndex = this.thumb.dir[0].id;

                    return secondIndex;
                    break;

                case 'end':

                    if (this.thumb.dir.length < 1) {
                        secondIndex = false;
                    }
                    else {
                        secondIndex = this.thumb.dir[(this.thumb.dir.length - 1)].id;
                        if (secondIndex == undefined) {
                            secondIndex = false;
                        }
                    }

                    return secondIndex;
                    break;
            }

            return secondIndex;
        },

        counterThumbnail: function () {

            //set count
            this.$set(this.loading.thumb, 'loaded', (this.loading.thumb.loaded + 1));

            //loading line
            var percent = 0;
            var x, max;

            x = this.loading.thumb.loaded;
            max = this.loading.thumb.total;

            percent = Math.ceil(100 * x / max);
            this.$set(this.loading, 'percent', percent);

            if (percent >= 100) {
                this.$set(this.loading, 'percent', 0);
            }
        },

        /**
         * @des select by name, type, src ...
         * @param by
         * @param val
         * @returns {*}
         */
        thumbSelectBy: function (by, val) {

            var thumbs = this.thumb.dir,
                thumb, thumbShowed;

            for (var i = 0; i < thumbs.length; i++) {

                thumb = thumbs[i];

                if (val == thumb[by]) {

                    thumbShowed = thumb;
                    this.$set(this.thumb, 'showed', thumb.id);

                    this.$set(thumb, 'selected', true);

                }
                else {

                    this.$set(thumb, 'selected', false);
                }
            }
            return thumbShowed;
        },

        thumbAddFile: function () {


        },
    }
};