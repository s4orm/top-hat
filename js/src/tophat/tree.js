Vue.component('tree', {

    template: '#tree-item-template',

    props: {
        tree: Object
    },

    data: function () {
        return {
            open: false,
            packStage: 1      // 1 default, 2 pack, 3 packing
        }
    },
    computed: {

        isFolder: function () {

            var children = false;
            if (this.tree.children && this.tree.children.length) {
                children = true;
            }
            return children;
        },

        isSelected: function () {
            var selected = false;
            if (this.tree.id == this.$root.treeParam.idEnd) {
                selected = true;
            }
            return selected;
        },

        isGif: function () {
            return (this.tree.ext == 'gif');
        },

        isZip: function () {

            return ['zip', 'rar'].includes(this.tree.ext);
        },

        isZipOpen: function () {

            return ((2 == this.packStage) && ['zip', 'rar'].includes(this.tree.ext))
        },

        isZipPacked: function () {

            return ((3 == this.packStage) && ['zip', 'rar'].includes(this.tree.ext))
        },

        isZipDefault: function () {

            return ((1 == this.packStage) && ['zip', 'rar'].includes(this.tree.ext))
        },

        isSvg: function () {
            return (this.tree.ext == 'svg');
        },

        isUnpacking: function () {
            return (this.tree.id == this.$root.loading.unpackingId);
        },

        isBlue: function () {
            if (['zip', 'rar'].includes(this.tree.ext)) {
                var sizeMb = this.convertToMByte(this.tree.size);
                return ((sizeMb > 0) && (sizeMb < 20));
            }
        },
        isGreen: function () {
            if (['zip', 'rar'].includes(this.tree.ext)) {
                var sizeMb = this.convertToMByte(this.tree.size);
                return ((sizeMb > 20) && (sizeMb < 70));
            }
        },
        isYellow: function () {
            if (['zip', 'rar'].includes(this.tree.ext)) {
                var sizeMb = this.convertToMByte(this.tree.size);
                return ((sizeMb > 70) && (sizeMb < 150));
            }
        },
        isOrange: function () {
            if (['zip', 'rar'].includes(this.tree.ext)) {
                var sizeMb = this.convertToMByte(this.tree.size);
                return ((sizeMb > 150) && (sizeMb < 250));
            }
        },
        isRed: function () {
            if (['zip', 'rar'].includes(this.tree.ext)) {
                var sizeMb = this.convertToMByte(this.tree.size);
                return (sizeMb > 250);
            }
        },


        openFolder: function () {

            if (this.tree.id == 'treeRoot') {
                this.tree.openFolder = true;
                return true;
            }

            if (this.tree.openFolder) {

                this.tree.openFolder = false;
                if (!this.open) {
                    this.open = true;
                    return this.open;
                }
                else {
                    this.open = false;
                    return this.open;
                }
            }

            return this.open;
        }
    },

    methods: {

        convertToMByte: function (str) {

            var obj = str.split(" ");

            if (obj.length < 2) {
                return false;
            }

            var val = obj[0];
            var type = obj[1];

            switch (type) {

                case 'kb':

                    return 1;
                    break;

                case 'mb':
                    return val;
                    break;

                case 'gb':

                    return val * 1024;
                    break;
            }

            return false;
        },

        clickZipRepack: function () {

            this.$root.zipFolderById(this.tree.id, function(){

                this.$set(this, 'open', false);
                this.$set(this, 'packStage', 3);
                this.treeRemoveChildren();

                setTimeout(function(){
                    this.$set(this, 'packStage', 1);
                }.bind(this), 1000);

            }.bind(this));
        },

        clickZipClose: function () {

            this.$set(this, 'open', false);
            this.$set(this, 'packStage', 3);

            setTimeout(function(){
                this.$set(this, 'packStage', 1);
            }.bind(this), 1000);
        },

        clickZipUnpack: function () {

            var id = this.tree.id;
            this.$root.unzipFile({id: id}, function(isFile, firstDir){

                //select opening zip
                this.$root.treeSelect(id);

                this.packStage = 2;
                this.open = true;

                var interVal = setInterval(function () {

                    if (this.$root.loading.unzip >= 100) {

                        clearInterval(interVal);

                        var children = this.$root.treeBranch(id);
                        this.treeAddChildren(children);

                        if (!isFile) { //firstDir inserted dir

                            var readyParamCounter = 0;

                            function readyParam () {

                                if (readyParamCounter > 1000) {
                                    return;
                                }

                                readyParamCounter += 1;

                                if (zz.q('#'+param.getIdByPath(firstDir))) {
                                    readyParamCounter = 0;
                                    zz.q('#'+param.getIdByPath(firstDir)+' [data-act="clickDirName"]').click();
                                    return;
                                }
                                else {
                                    setTimeout(readyParam.bind(this), 300);
                                }
                            }
                            setTimeout(readyParam.bind(this), 100);
                        }

                    }
                }.bind(this), 200);

            }.bind(this));
        },

        clickDirName: function () {

            if (false == this.open) {
                this.open = true;
            }

            var id = this.tree.id;
            var dir = param.tree.cachePaths[id];
            var isChildren = true;
            var children;

            //select branch
            this.$root.treeSelect(id);

            //load thumbnails
            this.$root.selectDir(dir);

            this.$root.setFocus('thumb');

            if (undefined == this.tree.children) {
                isChildren = false;
            }
            else {

                if (zz.has(this.tree.children, 'length')) {

                    if (this.tree.children.length == 0) {

                        isChildren = false;
                    }
                }
            }

            if (!isChildren) {

                if (['zip','rar'].includes(zz.getExtFromPath(dir))) {

                    var sizeMb = this.convertToMByte(this.tree.size);
                    if(sizeMb < 160) {

                        var el = zz.q('#' + id + ' [data-act="clickUnzip"]');
                        if (el) {
                           el.click();
                        }
                    }
                    this.open = false;
                    return;

                    //var interVal = setInterval(function () {
                    //
                    //    if (this.$root.loading.unzip >= 100) {
                    //
                    //        clearInterval(interVal);
                    //
                    //        children = this.$root.treeBranch(id);
                    //        this.treeAddChildren(children);
                    //    }
                    //}.bind(this), 200);

                }
                else {
                    children = this.$root.treeBranch(id);

                    function comp (a , b) {
                        var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                        return collator.compare(a.name, b.name);
                    }

                    if (children) {

                        children.sort(comp);

                        this.treeAddChildren(children);
                    }

                }
            }

            Vue.nextTick(function(){
                this.$root.treeScrollSelectedIntoView();
            }.bind(this));
        },
        /**
         * @des open dir or close
         */
        clickIcoDir: function () {

            if (this.open == false) {
                this.clickDirName();
            }
            else {

                this.open = false;
            }
        },

        clickReloadDir: function () {

            this.open = false;
            this.treeRemoveChildren();

            this.clickDirName();
        },

        treeAddChildren: function (children) {

            Vue.set(this.tree, 'children', []);

            if (!children) {
                return;
            }

            if (children.length > 0) {

                for (var i = 0; i < children.length; i++) {

                    this.tree.children.push(children[i]);

                }

                this.open = true;
            }

        },

        //treeAddChild: function (child) {
        //
        //    //Vue.set(this.tree.children, '', child);
        //    /**
        //     *
        //     {
        //         ext:false
        //         id:"tree1"
        //         isFolder:false
        //         name:"bin"
        //         size:false
        //     }
        //     */
        //
        //    if (!child) {
        //        return;
        //    }
        //
        //    if (this.tree.children) {
        //
        //        child.id = 'tree' + parseInt(this.tree.children[this.tree.children.length - 1].id.replace(/tree/, ''), 10) + 1;
        //        this.tree.children.push(child);
        //
        //        this.open = true;
        //    }
        //},

        treeRemoveChild: function (id) {

            var index = -1;

            var id = id || this.$root.treeParam.idEnd;

            if (!id) {
                return;
            }

            for (var i = 0; i < this.tree.children.length; i++) {

                if (id == this.tree.children[i].id) {

                    index = i;
                    break;
                }
            }
            this.$parent.tree.children.splice(index, 1);
        },

        treeRemoveChildren: function () {
            delete this.tree.children;
        },
    }
});