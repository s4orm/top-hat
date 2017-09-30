if (!zz) {
    zz = {};
}
if (!zz.ui) {
    zz.ui = {};
}


/**
 * @desctiption Dragable window
 * @param o { title: , content: , style: , param: , coor: }
 */

zz.ui.DragAndDrop = function (o) {

    var title = o.title || 'Drag And Drop Window',
        uiDesign = '',
        content = o.content || '',
        id = o.id || 'zz-DragAndDrop-' + zz.id(),
        type = o.type && Object.prototype.toString.call(o.type) != '[object Array]' ? [o.type] : o.type, //check if not array, then create array with 1 element
        style = o.style || {},
        param = o.param || {},
        coor = zz.coor.leftTopBlock(200, 200);


    this.box = document.createElement('div');
    this.box.id = id;
    this.box.className = 'zz-DragAndDrop';
    this.classDragable = 'zz-DragAndDrop';
    this.mouseDownPress = false;

    if (!style.top) {
        this.box.style.top = coor.y+'px';
    }
    if (!style.left) {
        this.box.style.left = coor.x+'px';
    }
    for(var i in style){
        this.box.style[i] = style[i];
    }
    for(var i in param){
        this.box[i] = param[i];
    }

    for(var i = 0, l = type.length; i < l; i += 1){
        uiDesign += this.html(type[i], title);
        if (type[i]=='header') {
            this.classDragable = 'zz-DragAndDrop-header-dd';
        }
    }

    this.box.innerHTML = uiDesign + this.html('content',content);

    this.mouseDownBind = this.mouseDown.bind(this);
    this.mouseUpBind = this.mouseUp.bind(this);

    this.box.addEventListener("mousedown", this.mouseDownBind, true);
    this.box.addEventListener("mouseup", this.mouseUpBind, true);
    document.body.appendChild(this.box);
    style = null;
    param = null;
    title = null;
    type = null;

    return this;
}


zz.ui.DragAndDrop.prototype.html = function (type, html) {

    var h;
    switch(type){
        case 'header':                                                                                                  // header on top
            h = ['<div class="zz-DragAndDrop-header" onselectstart="return false" onmousedown="return false">',
                    '<div class="zz-DragAndDrop-header-title" onselectstart="return false" onmousedown="return false">' + html + '</div>',
                    '<div class="zz-DragAndDrop-header-dd" onselectstart="return false" onmousedown="return false"></div>',
                    '<div class="zz-DragAndDrop-close">',
                        '<div class="zz-DragAndDrop-close-cross"></div>',
                    '</div>',
                '</div>'];
        break;
        case 'border':
            h = ['<div class="zz-DragAndDrop-border" style="width:' + this.box.style.width.replace('px', '') - 6 + 'px;height:' + this.box.style.height.replace('px', '') - 3 + 'px;"></div>'];
            break;
        case 'content':
            h = ['<div class="zz-DragAndDrop-content">' + html + '</div>'];
        default:
    }
    return h.join("");
}


zz.ui.DragAndDrop.prototype.mouseDown = function mouseDown (e) {
    /*
     * If bug and object not fire event key UP, then stop Drag&Drop by click LMB
     */
    if(this.mouseDownPress === true){
        
        document.removeEventListener("mousemove", this.mouseMoveBind, true);
        document.removeEventListener("mousedown", this.mouseDownBind, true);
        document.removeEventListener("mouseup", this.mouseUpBind, true);
        this.box.style.zIndex = 9999;
        document.ondragstart = null;
        document.body.onselectstart = null;
        this.mouseDownPress = false;
        return;
    }
    this.mouseDownPress = true;

    var target = e.target || e.srcElement;

    var e = zz.coor.fixEvent(e);

    if(target.className == 'zz-DragAndDrop-close-cross'){
        this.close();
        return false;
    }

    //remember mouse offset for draggable object
    this.mouseOffset = (function (e,obj){
        var docPos = zz.coor.leftTop(obj);
        return { x:e.pageX - docPos.x, y:e.pageY - docPos.y };
    })(e,this.box);

    this.cacheX = e.pageX;
    this.cacheY = e.pageY;

    this.box.style.zIndex = 9999;

    if(this.classDragable != target.className){
        return false;
    }
    this.mouseMoveBind = this.mouseMove.bind(this);

    document.addEventListener("mousemove", this.mouseMoveBind, true);
    document.ondragstart = function() { return false };
    document.body.onselectstart = function() { return false };
}

zz.ui.DragAndDrop.prototype.mouseMove = function mouseMove (e) {

    //this.box = e.target;
    var e = zz.coor.fixEvent(e);

    // for smoothness of movement we cache the coordinates of the mouse and move the window,
    // only if they have changed more than 10 px
    if(((Math.abs(this.cacheX - e.pageX) < 2) || (Math.abs(this.cacheY - e.pageY) < 2))){
        return false;
    }
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    this.box.style.left = e.pageX - this.mouseOffset.x + 'px';
    this.box.style.top = e.pageY - this.mouseOffset.y + 'px';
}

zz.ui.DragAndDrop.prototype.mouseUp = function mouseUp (e) {

    document.removeEventListener("mousemove", this.mouseMoveBind, true);
    this.box.style.zIndex = 0;
    document.ondragstart = null;
    document.body.onselectstart = null;
    this.mouseDownPress = false;
}

zz.ui.DragAndDrop.prototype.close = function () {
    document.body.removeChild(this.box);
    this.box = null;
}