var zz          = {};
    zz.coor     = {};
    zz.find     = {};

zz.q = function(sel, cond, el){

    var cond = cond || 'one';
    var el = el || document;

    if (cond == 'all') {
        return el.querySelectorAll(sel);
    }
    else { //one
        return el.querySelector(sel);
    }
};

/**
 * @des create cached events with uniq id
 * @type {Array}
 */
zz.events = {};

zz.has = function(object, key) {
  return object ? Object.prototype.hasOwnProperty.call(object, key) : false;
}

/**
 * @des We get the file extension after the point from the path /user/path/bla.jpg or '' empty
 * @param pathFull
 * @returns {*}
 */
zz.getExtFromPath = function (pathFull) {

    var extArr = pathFull.match(/\.([^.]+)$/);

    if (!extArr || extArr.length < 2) {
        return '';
    }

    var ext = extArr[1].toLowerCase();

    return ext;
};

/**
 * @description generator uniq id
 * @param pre prefix
 * @return string of num ('1', '2', '3' etc) or identifier ex: zz-form-1, zz-form-22 (zz-form- is prefix (pre))
 */
zz.id = function (pre) {

    var pre = pre || '';

    if (typeof pre === 'number') {
        pre = pre + '-';
    }

    return pre + (zz.id.uniq += 1);
};

zz.id.uniq = 0;

zz.isString = function (arg) {
    return typeof arg === 'string';
}
zz.isArray = function (arg) {
    return Object.prototype.toString.call(arg) == '[object Array]';
}
zz.isObj = function (arg) {
    return Object.prototype.toString.call(arg) == '[object Object]';
}


zz.arrGetKeyByVal = function(arr,val) {

    for (var i=0; i<arr.length; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return false;
}

zz.addClass = function (el, className) {                                                  //there is no test for the existence of a class
    if (!el.className) {
        return false;
    }
    var cls = el.className;
    if ((cls.split(/\s+/) + "").length > 1) {
        el.className = [el.className, " ", className].join("");
    } else {
        el.className = className;
    }
}
zz.removeClass = function (e, className) {
    var cls = e.className.split(/\s+/);
    var a = [], j = 0;

    for (var i = 0, len = cls.length; i < len; i += 1) {
        if (cls[i] != className) {
            a[j] = cls[i];
        }
        j += 1;
    }
    e.className = a.join(" ");
}

zz.isClass = function (el, className) {                                                  //there is no test for the existence of a class
    if (!el || !el.className) {
        return false;
    }
    var cls = el.className.split(/\s+/);
    var a = [], j = 0;

    for (var i = 0; i < cls.length; i += 1) {
        if (cls[i] == className) {
            return true;
        }
    }
    return false;
}
/**
 *
 * @param el
 * @param className Search class
 * @param classStop If this class is caught, then we do not rise up and return false
 * @returns {*}
 */
zz.find.parentClass = function (el, className, classStop) {

    if (!el) {
        return false;
    }

    if (zz.isClass(el, classStop)) {
        return false;
    }

    if (!zz.isClass(el, className)) {
        el = zz.find.parentClass(el.parentNode, className);
    }
    return el;
}

zz.find.parentTag = function (el, findTag) {
    if (el.tagName.toUpperCase() != findTag.toUpperCase()) {
        el = zz.find.parentTag(el.parentNode, findTag);
    }
    return el;
}


/**
 *
 * @param el
 * @param attrName Looking for the value of an attribute by name
 * @returns {*}
 */
zz.find.parentAttr = function (el, attrName, classStop) {

    if (!el) {
        return false;
    }

    if (!el.getAttribute) {
        return false;
    }

    var attr = el.getAttribute(attrName);

    if (attr) {
        return attr;
    }

    if (!attr) {
        attr = zz.find.parentAttr(el.parentNode, attrName);
    }
    return attr;
}

/**
 * @description Get cookie by name
 */
zz.getCookie = function (name) {

    if (!name) {
        return false;
    }

    var reg = new RegExp(name + "=[^;]+"),
        cookie = document.cookie,
        cookie = cookie.match(reg); //get out of the cookies line our cookie

    if (cookie == null) {
        return false;
    }

    cookie = cookie[0].split(name + '=')[1];
    cookie = decodeURIComponent(cookie);
    cookie = JSON.parse(cookie);

    return cookie;
}
/**
 * @description write cookie (basket)
 */
zz.setCookie = function (name, json, time) {

    if (!name) {
        return false;
    }

    var time = time || 'session',
        d = new Date(),
        domain = '.' + document.domain.replace(/www\./, ''),
        cookie;

    //if there is no time, then cookie is session
    if (time == 'session') {

        document.cookie = name + '=' + encodeURIComponent(JSON.stringify(json)) + '; path=/; domain=' + domain + ';';
        return;
    }

    switch(time) {

        case 'year':

            d.setDate(d.getDate() + 365);

            break;

        case 'month':

            d.setDate(d.getDate() + 31);

            break;

        case 'week':

            d.setDate(d.getDate() + 7);

            break;

        case 'day':

            d.setDate(d.getDate() + 1);

            break;
    }

    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(json)) + '; path=/; domain=' + domain + '; expires=' + d.toUTCString();

}

/**
 *
 * @param {Object} el - element
 * @description  this method return coordinates of cursor
**/
zz.coor.leftTop = function (el) {
    var left = 0;
    var top = 0;

    while (el.offsetParent) {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent;
    }

    left += el.offsetLeft;
    top += el.offsetTop;

    return {x:left, y:top};
}
//zz.event()
zz.coor.fixEvent = function (e) {

    e = e || window.event;

    if (e.pageX == null && e.clientX != null) {     // add pageX/pageY for IE
        var de = document.documentElement;
        var body = document.body;
        e.pageX = e.clientX + (de && de.scrollLeft || body && body.scrollLeft || 0) - (de.clientLeft || 0);
        e.pageY = e.clientY + (de && de.scrollTop || body && body.scrollTop || 0) - (de.clientTop || 0);
    }

    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));          // add which for IE
    }

    return e;
}

/**
 *
 * @param id
 *  @param style
 *
 * return (element.currentStyle || window.getComputedStyle(id, null))[style];
 *  getStyle('cont', 'width'); // 100px
 */
zz.getStyle = function (el, style) {
    return window.getComputedStyle(el, null)[style];
}


/**
 * this method return coordinates for block (example: div) - left and top
 * @param {String} width of block
 * @param {String} height of block
 */
zz.coor.leftTopBlock = function (width, height) {
    var d, sTop, y, x;

    d = document.documentElement;
    sTop = d.scrollTop || document.body.scrollTop;
    y = Math.floor((d.clientHeight - height) / 2) + sTop;
    x = Math.floor((d.clientWidth - width) / 2);
    return {x:x, y:y};
}


/**
 *
 * @description Get storage object and return either a string, or immediately json, also write, serialize the transferred object to a string
 *
 * @type {{}}
 */
zz.localStorage = {};

zz.localStorage.set = function (name, val) {

    if(!localStorage) {
        return false;
    }

    var value = '';

    if (typeof val == 'object') {
        value = JSON.stringify(val);
    }
    else if (typeof val == 'string') {
        value = val;
    }
    else {
        return false;
    }

    try {
       localStorage.setItem('zz_' + name, value);
    }
    catch (e) {
       if (e == QUOTA_EXCEEDED_ERR) {
           console.log('memory end');
       }
    }
}

zz.localStorage.get = function (name) {

    var value = localStorage.getItem('zz_' + name);

        if (value) {

            try {
                return JSON.parse(value);
            }
            catch (e) {
                return value;
            }
        }

        return false;
}

zz.localStorage.remove = function (name) {
    try {
        localStorage.removeItem('zz_' + name);
    }
    catch (e) {
        return false;
    }
}

/**
 * @description Pattern Chain (defferred) executed by chain
 *
 * @example:
 *
 * var c = new Chain();
 *
 * c.add(function () {
 *          console.log(1);
 *          c.next();
 * }).
 * add(function () {
 *          setTimeout(function () {
 *               console.log(2);
 *               c.next();
 *           }, 1000);
 * }).
 * start();
 *
 * or you can defer the call to execute the chain, the chain starts only on .start();
 *
 * var b = 20;
 *
 * c.start();
 *
 *
 *
 */
zz.Chain = function () {
};

zz.Chain.prototype.deferred = [];

zz.Chain.prototype.add = function (fn) {
    this.deferred.push(fn);
    return this;
}
zz.Chain.prototype.next = function () {
    if (this.deferred.length) {
        this.deferred.shift().apply(this);
    }
}
zz.Chain.prototype.start = function () {
    this.deferred.shift().apply(this);
}

/**
 *
 * @param callback
 * @description Execute the function after loading the document
 */
zz.load = function(callback){
    window.addEventListener("load", callback, false);
};

/**
 *
 * @param el
 * @description remove element
 */
zz.remove = function (el) {
    if (el) {
        el.parentNode.removeChild(el);
    }
}


//Load scripts, css, templates (scene-tpl -> id = scene )
zz.loadSCT = function (file, callback) {

    if (!file) {
        return;
    }

    var ext = file.match(/[^.]+$/)+'',
        ns = "?ns="+(Math.random()*1000),
        head = document.getElementsByTagName("head")[0],
        body = document.getElementsByTagName("body")[0],
        id, f;

    if (ext.search(/js|css|tpl/) == -1) {
        return;
    }

    if(ext == 'css') {
        file += ns;
        f = document.createElement("link");
        f.setAttribute("rel", "stylesheet");
        f.setAttribute("type", "text/css");
        f.setAttribute("href", file);
        head.appendChild(f);
    }
    else if(ext == 'js') {
        file += ns;
        f = document.createElement("script");
        f.setAttribute("type","text/javascript");
        f.setAttribute("src", file);
        head.appendChild(f);
    }
    else if(ext == 'tpl') {

        zz.ajax(file, 'GET', {ns: ns}, 'html', function (data) {

            body.insertAdjacentHTML('afterbegin', data);
            callback();

        }, {decrypt: false});
        return;
    }

    f.onload = function () {
            callback();
    }
};

zz.require = function (prop, callback) {

    var count = 0,
        i;

    for (var i = 0; i < prop.length; i += 1) {

        (function (file) {

            count++;

            zz.loadSCT(file, function () {

                if (count == prop.length) {
                    setTimeout( callback, 50);
                }
            });

        })(prop[i]);
    }
};

/**
 * @des window
 */

zz.window = {};

zz.window.create = function(type, id, param){

    if (zz.q('#zz-window')) {
        return;
    }

    var html, ttl, btnFocus = null, item;

    if (!zz.has(param, 'title')) {
        param.title = ''
    }

    switch (type) {

        case 'confirm':

            var checkboxHTMLArr = [];

            if (zz.has(param, 'el')) {

                for (var i in param.el) {
                    item = param.el[i];

                    if (item.type == 'checkbox') {

                        checkboxHTMLArr.push('<input type="checkbox" data-el="checkbox" class="zz__window__checkbox-list" data-name="' + item.name + '">' + item.title);
                    }
                }
            }

            html = ['<div class="zz__window__des">',
                        param.des,
                        checkboxHTMLArr.join(''),
                    '</div>',
                    '<div class="zz__window__btn-box">',
                        '<input id="zz-btn-esc" type="button" class="zz__window__btn" value="esc" onclick="zz.window.click(\'close\')" tabindex="1">',
                        '<input id="zz-btn-ok" type="button" class="zz__window__btn" value="ok" onclick="zz.window.click(\'confirm\', \''+id+'\')" tabindex="2">',
                    '</div>'].join('');
            break;

        case 'file':
            html = '<div class="zz__window__des">'+param.des+'</div><div class="zz__window__btn-box">name: <input type="text" id="zz-window-filename" class="zz__window__file"><input id="zz-btn-ok" type="button" class="zz__window__btn" value="ok" onclick="zz.window.click(\'file\', \''+id+'\', this)" tabindex="1"></div>';
            break;

        case 'rename_group':

            if (!param.list) {
                return;
            }

            var list = [];
            for (var i=0;i<param.list.length;i++){
                list.push('<tr class="zz-table-group-list__tr"><td class="zz-table-group-list__original" data-type="original">'+param.list[i]+'</td><td class="zz-table-group-list__replaced" data-type="replaced">'+param.list[i]+'</td></tr>');
            }

            html = ['<div class="zz__window__des">',
                        param.des,

                        '<div>',
                            'RegExp: <input type="text" id="zz-window-regexp" class="zz__window__file">',
                            '&nbsp;',
                            'Replace: <input type="text" id="zz-window-replace" class="zz__window__file">',
                            '<select id="zz-window-replace-select" class="zz__window__select">',
                                '<option data-reg="" data-replace="">...</option>',
                                '<option data-reg="([a-z]+)(.+)?(\\.[a-z]+)" data-replace="$1$3">Adobe.ext</option>',
                                '<option data-reg="([a-z0-9-]+[0-9]+)(.+)?(\\.[a-z]+)" data-replace="$1$3">Alph-10-123.ext</option>',
                            '</select>',
                        '</div>',
                        '<div>',
                            '<table id="zz-window-replace-group-list" class="zz-table-group-list">',
                                list.join(''),
                            '</table>',
                        '</div>',
                    '</div>',
                    '<div class="zz__window__btn-box">',
                        '<input id="zz-btn-ok" type="button" class="zz__window__btn" value="ok">',
                    '</div>'].join('');
            break;

        case 'list':

            if (!param.list) {
                return;
            }

            var list = [];
            for (var i=0;i<param.list.length;i++){
                list.push('<tr class="zz-table-group-list__tr"><td class="zz-table-group-list__bookmark" data-fullpath="'+param.list[i].replace('"', '&quot;')+'">'+param.list[i]+'</td></tr>');
            }

            html = ['<div class="zz__window__des">',
                        param.des,
                        '<div>',
                            '<table id="zz-window-replace-group-list" class="zz-table-group-list" onclick="zz.window.click(\'list\',\''+id+'\', this, event)">',
                                list.join(''),
                            '</table>',
                        '</div>',
                    '</div>'].join('');
            break;

        case 'alert':
            html = '<div class="zz__window__des">'+param.des+'</div><div class="zz__window__btn-box"><input id="zz-btn-ok" type="button" class="zz__window__btn" value="esc" onclick="zz.window.click(\'close\')"></div>';
            break;

        case 'select_btn':

            var btnArr = [];
            if (param.btn) {
                param.btn.forEach(function(item, index){
                    btnArr.push('<input id="zz-btn-'+item.name+'" type="button" class="zz__window__btn" value="'+item.name+'" onclick="zz.window.click(\'select_btn\',\''+id+'\', this)" tabindex="'+(index + 1)+'">');
                });
            }

            html = ['<div class="zz__window__des">',
                        param.des,
                    '</div>',
                    '<div class="zz__window__btn-box">',
                        btnArr.join(''),
                    '</div>'].join('');
            break;

        case 'img_wiki':
            html = '<div class="zz__window__img-box"><div style="background-image: url('+param.src+')" class="zz__window__img"></div><div class="zz__window__img-des"><a href="https://www.google.ru/search?q='+param.title+'&tbm=isch" target="_blank" class="zz__window__img-link">google images</a> <a href="https://ru.wikipedia.org/wiki/'+param.title+'" target="_blank" class="zz__window__img-link">wiki</a><br><br>'+param.des+'</div></div>';
            break;

        case 'img':
            html = '<div class="zz__window__img-box"><div style="background-image: url('+param.src+')" class="zz__window__img"></div><div class="zz__window__img-des">'+param.des+'</div></div>';
            break;
    }

    ttl = '<div class="zz__window__ttl"><div class="zz__window__title" id="zz-window-title">'+param.title+'</div><div id="zz-btn-close" class="zz__window__btn zz__window__btn__close" onclick="zz.window.click(\'close\')">✕</div></div>';

    if (!param.classWindow) {
        param.classWindow = '';
    }

    html = '<div id="zz-window" class="zz__window '+param.classWindow+'">' + ttl + html + '</div>';

    document.body.insertAdjacentHTML('afterBegin', html);

    switch (type) {

        case 'file':

            var input = zz.q('#zz-window-filename');
            if (input) {
                input.value = param.filename;
                input.focus();
            //    input.addEventListener('keypress', function(){
            //
            //    }, false);
            }
            break;

        case 'confirm':
            btnFocus = zz.q('#zz-btn-esc');
            break;

        case 'select_btn':
            btnFocus = zz.q('#zz-window [tabindex="1"]');
            break;

        default:
            btnFocus = zz.q('#zz-btn-ok');
    }

    if (btnFocus) {
        btnFocus.focus();
        zz.window.tabindex = 1;
    }

    var winEl = zz.q('#zz-window');
    if (winEl) {
        winEl.addEventListener('keydown', zz.window.keydown, false);
    }
}

zz.window.tabindex = 1;

zz.window.keydown = function (e) {

    var indexElements = zz.q('#zz-window [tabindex]', 'all');
    var currentIndex = zz.window.tabindex;

    if (!indexElements) {
        return;
    }

    //arrow right
    if (39 == e.keyCode) {

        for (var i = 0; i<indexElements.length; i++) {

            if (currentIndex == indexElements[i].getAttribute('tabindex')) {

                if (indexElements[i+1]) {
                    zz.window.tabindex += 1;
                    indexElements[i+1].focus();
                }
                break;
            }
        }
    }
    //arrow left
    if (37 == e.keyCode) {

        for (var i = 0; i<indexElements.length; i++) {

            if (currentIndex == indexElements[i].getAttribute('tabindex')) {
                if (indexElements[i-1]) {
                    zz.window.tabindex -= 1;
                    indexElements[i-1].focus();
                }
                break;
            }
        }
    }
}

zz.window.renameGroup = function(param, callback) {

    var param = param || {};

    //unique id
    var id = zz.id('window');


    //cache callback
    zz.events[id] = callback;
    zz.window.create('rename_group', id, param);

    var inputRegExp = zz.q('#zz-window-regexp');
    var inputReplace = zz.q('#zz-window-replace');
    var inputReplaceSelect = zz.q('#zz-window-replace-select');
    var btnOk = zz.q('#zz-btn-ok');

    function keyEnter() {

        var regexpVal = inputRegExp.value.toString();
        var replaceVal = inputReplace.value.toString();

        try {
            var reg = new RegExp(regexpVal, "img");
        }
        catch (e) {

        }
        if (!reg) {
            return;
        }

        var sAll = zz.q('#zz-window-replace-group-list tr', 'all');
        var rowEl, tdEl, oldName, newName,
            list = {}; //for test existing name

        for (var i=0;i<sAll.length;i++){

            rowEl = sAll[i];
            tdEl = zz.q('td', 'all', rowEl);

            oldName = tdEl[0].innerHTML;

            newName = oldName.replace(reg, replaceVal);

            if (list[newName]) {
                tdEl[1].style.color = '#ff0000';
            }
            else {
                tdEl[1].style.color = '#000000';
            }
            list[newName] = true;
            tdEl[1].innerHTML = newName;
        }
    }

    function selectReplace(e) {

        var el = e.target.options[e.target.selectedIndex];
        var reg = el.getAttribute('data-reg');
        var replace = el.getAttribute('data-replace');

        inputRegExp.value = reg;
        inputReplace.value = replace;
        keyEnter();
    }


    if (inputRegExp) {
        inputRegExp.addEventListener('input', keyEnter, true);
        inputRegExp.focus();
    }

    if (inputReplace) {
        inputReplace.addEventListener('input', keyEnter, false);
    }

    if (inputReplaceSelect) {
        inputReplaceSelect.addEventListener('change', selectReplace, false);
    }



    if (btnOk) {
        btnOk.addEventListener('click', function(){

            var tree = [],
                flagRepeatName = false,
                oldName,
                newName,
                list = {}; //for test existing name

            var sAll = zz.q('#zz-window-replace-group-list tr', 'all');
            var rowEl, tdEl;

            for (var i=0;i<sAll.length;i++){

                rowEl = sAll[i];
                tdEl = zz.q('td', 'all', rowEl);

                oldName = tdEl[0].innerHTML;
                newName = tdEl[1].innerHTML;

                if (list[newName]) {
                    tdEl[1].style.color = '#ff0000';
                    flagRepeatName = true;
                }

                list[newName] = true;

                if (flagRepeatName) {
                    return;
                }

                tree.push({ oldName: tdEl[0].innerHTML, newName: tdEl[1].innerHTML });
            }

            zz.events[id](tree); //run callback as reaction to event
            zz.events[id] = null;
            zz.window.close();

        }, false);
    }
}

zz.window.file = function(param, callback) {

    var param = param || {};

    //unique id
    var id = zz.id('window');

    //cache callback
    zz.events[id] = callback;
    zz.window.create('file', id, param);

    function keyEnter(e) {
        var key = e.keyCode;
        if (e.ctrlKey) {

            if (13 == key) {

                if (!id) {
                    return;
                }

                var name = zz.q('#zz-window-filename').value;

                if (name != '') {

                    callback(zz.q('#zz-window-filename').value); //run callback as reaction to event
                    zz.window.close();
                }
                else {
                    zz.q('.zz__window__des').innerHTML += ' <b style="color:red">Enter name!</b>';
                }

            }
        }
    }

    var input = zz.q('#zz-window-filename');
    if (input) {
        input.addEventListener('keydown', keyEnter, false);
        input.focus();
    }
}

zz.window.img = function(param, callback) {
    //unique id
    var id = zz.id('window');
    //cache callback
    zz.events[id] = callback;
    zz.window.create('img', id, param);
}

zz.window.list = function(param, callback) {
    //unique id
    var id = zz.id('window');
    //cache callback
    zz.events[id] = callback;
    zz.window.create('list', id, param);
}

zz.window.img_wiki = function(param, callback) {
    //unique id
    var id = zz.id('window');
    //cache callback
    zz.events[id] = callback;
    zz.window.create('img_wiki', id, param);
}

zz.window.select_btn = function(param, callback) {
    //unique id
    var id = zz.id('window');
    //cache callback
    zz.events[id] = callback;
    zz.window.create('select_btn', id, param);
}

zz.window.jumpToTab = function (e) {

}

/**
 *
 * @param param {
 *
 *  checkboxList: [{name:'', title:'',}, ...]
 * }
 * @param callback
 */
zz.window.confirm = function(param, callback) {
    //unique id
    var id = zz.id('window');
    //cache callback
    zz.events[id] = callback;
    zz.window.create('confirm', id, param);
}

zz.window.alert = function(param, callback) {

    //unique id
    var id = zz.id('window');

    //cache callback
    zz.events[id] = callback;
    zz.window.create('alert', id, param);

    if (param.timer) {

        param.timer = parseInt(param.timer);

        if (param.timer > 0) {
            setTimeout(zz.window.close, param.timer);
        }
    }
}
/**
 * @des click on popup window box event handler
 * @param type
 * @param id
 * @param el element
 * @param e event
 */
zz.window.click = function (type, id, el, e) {

    switch (type) {

        case 'ok':
            if (!id) {
                return;
            }
            zz.events[id](); //run callback as reaction to event
            zz.events[id] = null;
            zz.window.close();
            break;

        case 'confirm':

            var listEl = zz.q('#zz-window [data-el]', 'all');
            var item,
                list = {},
                name;

            if (listEl) {

                for (var i=0;i<listEl.length;i++) {

                    item = listEl[i];

                    if ('checkbox' == item.type) {

                        if (item.checked) {

                            name = item.getAttribute('data-name');
                            if (!list.checkbox) {
                                list.checkbox = {};
                            }
                            list.checkbox[name] = 'checked';
                        }
                    }
                }

                zz.events[id]( {el:list} ); //run callback as reaction to event
                zz.events[id] = null;
                zz.window.close();
            }

            break;

        case 'file':

            var name = '';

            if (!id) {
                return;
            }

            name = zz.q('#zz-window-filename').value;

            if (name != '') {
                zz.events[id](zz.q('#zz-window-filename').value); //run callback as reaction to event
                zz.events[id] = null;
                zz.window.close();
            }
            else {
                zz.q('.zz__window__des').innerHTML += ' <b style="color:red">Enter name!</b>';
            }
            break;

        case 'select_btn':

            if (!id) {
                return;
            }

            zz.events[id](el.value); //run callback as reaction to event
            zz.events[id] = null;
            zz.window.close();
            break;

        case 'list':

            var fullpath = e.target.getAttribute('data-fullpath');

            if (!fullpath) {
                return;
            }

            zz.events[id](fullpath); //run callback as reaction to event
            zz.events[id] = null;
            zz.window.close();
            break;

        case 'close':

            zz.window.close();
            return;
            break;
    }
}

zz.window.close = function () {

    var win = zz.q('#zz-window');

    if (win) {
        win.parentNode.removeChild(win);
    }
}

zz.sizeFormat = function(bites) {

    var size = bites;
    var kb, mb, gb, format, sizeFormated;
    kb = (size / 1024).toFixed(2);

    sizeFormated = kb;
    format = 'kb';

    if (kb > 1000) {

        mb = (kb / 1024).toFixed(2);
        sizeFormated = mb;
        format = 'mb';
    }
    if (mb > 1000) {

        gb = (mb / 1024).toFixed(2);
        sizeFormated = gb;
        format = 'gb';
    }

    return {format: format, sizeFormated: sizeFormated};
}

zz.appendToObj = function(obj, param) {

    if (!obj) {
        return;
    }
    if (!param) {
        return;
    }

    for (var i in param) {
        obj[i] = param[i];
    }
}

/**
 * @des Drag And Drop obj
 * @type {{sel: HTMLElement for binding listener }}
 * @tmp {offset: {
 *            top:int,
 *            left:int,
 *            step: int,
 *            boxBuildedFlag:boolean,
 *            boxBuild
 *            }}
 */
zz.dd = {
};

zz.dd.init = function (o) {

    return function (o) {

        var dd = {
            sel: document.body,
            title: 'move',
            tmp: null,
            boxDataDD: [],
            mouseinitFn: function(){},
            mousemoveFn: function(){},
            callback: function () {},
            data_dd: ''
        };

        if (o.sel) {
            dd.sel = o.sel;
        }
        //if (o.title) {
        //    dd.title = o.title;
        //}

        if (o.boxDataDD) {
            dd.boxDataDD = o.boxDataDD;
        }
        if (o.callback) {
            dd.callback = o.callback;
        }
        if (o.mouseMove) {
            dd.mousemoveFn = o.mouseMove;
        }

        if (o.mouseInit) {
            dd.mouseinitFn = o.mouseInit;
        }

        /*
        * @des
        * @param e
        */
        dd.mousedownDD = function (e) {

            var data_dd = e.target.getAttribute('data-dd');

            if (!data_dd) {
                return;
            }

            dd.data_dd = data_dd;

            if (e.ctrlKey) {
                dd.title = o.titleCtrl;
            }
            else {
                dd.title = o.title;
            }

            dd.tmp = {
                boxBuildedFlag: false,
                offset: {
                    left: e.pageX,
                    top: e.pageY
                },
            };

            zz.q(dd.sel).addEventListener('mousemove', dd.mousemoveDD, false);

            dd.mouseinitFn(e, {data_dd:data_dd});
        };
        /**
        * @des
        * @param e
        */
        dd.mouseupDD = function (e) {

           if (!dd.tmp) {
               zz.q(dd.sel).removeEventListener('mousemove', dd.mousemoveDD, false);
               dd.tmp = null;
               return;
           }

           zz.q(dd.sel).removeEventListener('mousemove', dd.mousemoveDD, false);

           if (dd.tmp.box) {
               dd.tmp.box.parentNode.removeChild(dd.tmp.box);
           }

           dd.tmp.box= null;
           dd.tmp = null;

           dd.callback(e, {data_dd: dd.data_dd});
        };

        /**
        * @des
        * @param e
        */
        dd.mousemoveDD = function (e) {

            if (dd.boxDataDD.includes(dd.data_dd)) {

                        //if (dd.boxFlag === true) {

                if (dd.tmp.boxBuildedFlag === false) { //create only one time

                    dd.tmp.boxBuildedFlag = true;

                    dd.boxBuild(e);
                }
            }

            var ddBox = dd.tmp.box,
                el;

            if (ddBox) {
                ddBox.style.left = e.pageX + 5 + 'px';
                ddBox.style.top = e.pageY + 5 + 'px';
            }

            el = document.elementFromPoint(e.pageX, e.pageY);

            el = el.parentNode;

            if (!el) {
                return;
            }

            if (dd.mousemoveFn) {

                //(x1 = x2) = 0, (x1 < x2) = 1 step to right, move to left, (x1 > x2) = -1 step to left, move to right
                //(y1 = y2) = 0, (y1 < y2) = 1 step to bottom, move to top, (y1 > y2) = -1 step to top, move to bottom

                var x1 = dd.tmp.offset.left;
                var x2 = e.pageX;
                var y1 = dd.tmp.offset.top;
                var y2 = e.pageY;

                dd.tmp.offset = {
                    left: e.pageX,
                    top: e.pageY
                };

                var offset = {left:0, top:0};

                    offset.left = x2 - x1;
                    offset.top = y2 - y1;
                    offset.data_dd = dd.data_dd;

                dd.mousemoveFn(e, offset);
                return;
            }
        };

        dd.boxBuild = function (e) {

            var x = e.pageX,
               y = e.pageY,
               box = document.createElement('div'),
               title = dd.title;

            box.className = 'zz-drag-and-drop';
            box.innerHTML = title;
            box.style.left = x + 'px';
            box.style.top = y + 'px';

            dd.tmp.box = box;

            zz.q(dd.sel).appendChild(box);
        };

        zz.q(dd.sel).addEventListener('mousedown', dd.mousedownDD, false);
        zz.q(dd.sel).addEventListener('mouseup', dd.mouseupDD, false);
    }(o);
};
/**
 * @des division remainder %
 * @param a
 * @param b
 * @returns {{int: number, remainder: number}}
 */
zz.remainder = function (a, b) {
    var cInteger = Math.floor(a/b);
    var cRemainder = a % b;

    return {int: cInteger, remainder: cRemainder};
}