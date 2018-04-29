var searchMixin = {

    methods: {
        /**
         * @des press Enter on input search line in top
         */
        searchLineKeyUp: function (e) {

            var target = e.target;
            var val = target.value;
            var fullpath = this.fullpath;
            var searchFileDB = '';

            var pathObj = path.parse(fullpath);

            this.loadingStart();
            this.$set(this.search, 'notfound', false);
            this.console('start search: ' + val);
            this.$set(this.search, 'val', val);

            //removable disk
            if (pathObj.dir.search(/\/media/) != -1) {

                searchFileDB = path.join(fullpath, 'searchDB.json');

                fs.open(searchFileDB, 'r', function (err, fileData) {

                    //if file exist
                    if (!err) {

                        //delete file and create new searchDB.json
                        if (e.ctrlKey) {

                            var statFs = fs.lstatSync(searchFileDB);

                            if (statFs.isFile()) {
                                fs.unlinkSync(searchFileDB);
                                this.searchFileDBCreate(fullpath, searchFileDB, val);
                            }
                        }
                        else {

                            this.console('in exist', 'append');

                            fs.readFile(searchFileDB, function(err, data) {

                                if (err) {
                                    console.log(err);
                                }

                                var list = JSON.parse(data);
                                var result = this.searchInList(val, list);
                                //set
                                this.searchSetList(result);

                            }.bind(this));
                        }
                    }
                    //if file does not exist
                    else {

                        if (err.code === 'ENOENT') {

                            this.console('createNewDB', 'append');


                            this.fileGetListByDir(fullpath, function(list){

                                var result = this.searchInList(val, list);
                                //set
                                this.searchSetList(result);

                                var text = JSON.stringify(list);

				fs.writeFile(searchFileDB, text, function(err) {

                                    if(err) {
                                        return console.log(err);
                                    }

                                }.bind(this));

                            }.bind(this));
                        }
                    }

                }.bind(this));
            }
            else {

                this.fileGetListByDir(fullpath, function(list) {

                    var result = this.searchInList(val, list);
                    this.searchSetList(result);

                }.bind(this));
            }
        },

        searchFileDBCreate: function(fullpath, searchFileDB, searchStr) {

            this.console('createNewDB', 'append');

            this.fileGetListByDir(fullpath, function(list){

                var result = this.searchInList(searchStr, list);
                //set
                this.searchSetList(result);

                var text = JSON.stringify(list);

                fs.writeFile(searchFileDB, text, function(err) {

                    if(err) {
                        return console.log(err);
                    }

                }.bind(this));

            }.bind(this));

        },

        searchInList: function (text, list) {

            var reg = new RegExp(text, "i");
            var result = {};
            var dir, item;

            for (var i=0; i<list.length; i++) {

                item = list[i];

		if (item) {
		  
		  if (item.search(reg) != -1) {

		      dir = path.parse(item).dir;

		      if (!result[dir]) {
			      
			  result[dir] = [];
			  result[dir].push(item);
		      }
		      else {
			  result[dir].push(item);
		      }
		  }
		}
		//else {
		//   console.log(i, item); 
		//}
            }

            return result;
        },

        searchSetList: function(listObject) {

            if (!listObject) {
                console.log('need list Object');
                return;
            }

            var list = {};
            var flagNotfound = true;

            for (var i in listObject) {

                flagNotfound = false;

                list[i] = { dir:i, file:listObject[i], total: listObject[i].length };

                if (listObject[i].length < 3) {
                    list[i].showFiles = true;
                }
                //list.push({ dir:i, file:listObject[i], total: listObject[i].length });
            }

            this.$set(this.search, 'list', list);


            if (flagNotfound) {
                this.$set(this.search, 'notfound', true);
                setTimeout(function(){
                    this.$set(this.search, 'notfound', false);
                }.bind(this), 3000)
            }

            this.loadingEnd();
        },

        /**
         * @des click: close, item (dirpath - > load tree, loadThumb
         * @param e
         */
        clickSearch: function (e) {
            
            var t = e.target;
            var act = t.getAttribute('data-act'),
                fullpath, dir, name;
            
            switch (act) {
                
                case 'item':
                    
                    dir = t.getAttribute('data-fullpath');

                    if (!dir) {
                        return;
                    }

                    this.treeJumpToDir(dir);

                    break;

                case 'group': //show group of files

                    dir = t.getAttribute('data-fullpath');

                    if (this.search.list[dir].showFiles == true) {
                        this.$set(this.search.list[dir], 'showFiles', false);
                    }
                    else {
                        this.$set(this.search.list[dir], 'showFiles', true);
                    }

                    break;

                case 'file':

                    dir = t.getAttribute('data-dir');
                    fullpath = t.getAttribute('data-fullpath');
                    name = path.parse(fullpath).base;

                    this.treeJumpToDir(dir);
                    setTimeout(function() {
                    //Vue.nextTick(function() {
                        console.log(name);
                        this.thumbSelectBy('name', name);
                    //}.bind(this));
                    }.bind(this), 2000);

                    break;
                
                case 'turnOff':
                    if (this.search.turnOff == false) {
                        this.$set(this.search, 'turnOff', true);
                    }
                    else {
                        this.$set(this.search, 'turnOff', false);
                    }
                    break;

                case 'close':

                    this.$set(this.search, 'list', {});
                    this.$set(this.search, 'val', '');
                    break;
            }
        },

    }
}