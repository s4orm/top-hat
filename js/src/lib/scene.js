/**
 * @des Load image to scene
 * @paramFile src
 * @paramFile maxWidth
 * @paramFile maxHeight
 * @paramFile callback
 */
function sceneLoad(thumb, paramFile, callback) {

    //clear canvas scene
    if (typeof thumb === 'string') {

        if ('clear' == thumb) {

            var canvas = document.querySelector('#scene');
            if (!canvas) {
                return;
            }
            var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    var maxWidth = paramFile.maxWidth;
    var maxHeight = paramFile.maxHeight;

    var src = thumb.src;
    var ext = thumb.ext;

    switch (ext) {

        case 'gif':

            var img = new Image();

            img.onload = function(){

                var canvas = document.querySelector('#scene');

                if (callback) {
                    callback({width: img.width, height: img.height});
                }

                if (!canvas) {
                    return;
                }

                var ctx = canvas.getContext("2d");

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                img = null;
            };

            img.src = param.encUrl(src);

            break;

        case 'svg':

            var canvas = document.querySelector('#scene');

            if (!canvas) {
                return;
            }

            var ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            break;

        case 'text':

            break;
        
        case 'ai':            
            
            var whThumb;

            if ((thumb.width > maxWidth) || (thumb.height > maxHeight)) {
                whThumb = calculateAspectRatio(thumb.width, thumb.height, maxWidth, maxHeight);
            }
            else {
                whThumb = {
                    w: thumb.width,
                    h: thumb.height
                };
            }

            var left = (maxWidth - whThumb.w) / 2;
            var top = (maxHeight - whThumb.h) / 2;

            var canvas = document.querySelector('#scene');
            var ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (paramFile.imgData) {
                ctx.putImageData(paramFile.imgData, left, top);
            }

            if (callback) {
                callback({width: thumb.width, height: thumb.height});
            }

            break;

        case 'pdf':

            break;

        case 'eps': //same as ai

            var whThumb, left, top;

            if ((!thumb.width) || (!thumb.height)) {
                return;
            }

            if ((thumb.width > maxWidth) || (thumb.height > maxHeight)) {
                whThumb = calculateAspectRatio(thumb.width, thumb.height, maxWidth, maxHeight);
            }
            else {
                whThumb = {
                    w: thumb.width,
                    h: thumb.height
                };
            }

            if (maxWidth == whThumb.w) {
                left = 10;
            }
            else {
                left = (maxWidth - whThumb.w) / 2;
            }

            if (maxHeight == whThumb.h) {
                top = 10;
            }
            else {
                top = (maxHeight - whThumb.h) / 2;
            }

            if (left == undefined) {
                left = 0;
            }
            if (top == undefined) {
                top = 0;
            }

            var canvas = document.querySelector('#scene');
            var ctx = canvas.getContext("2d");

            if (!ctx) {
                console.log('ctx not found');
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (paramFile.imgData) {
                ctx.putImageData(paramFile.imgData, left, top); //Failed to execute 'putImageData' on 'CanvasRenderingContext2D': The provided double value is non-finite.
            }

            if (callback) {
                callback({width: thumb.width, height: thumb.height});
            }

            break;

        default:

            var img = new Image();

            img.onload = function() {

                var whThumb;

                if ((img.width > maxWidth) || (img.height > maxHeight)) {
                    whThumb = calculateAspectRatio(img.width, img.height, maxWidth, maxHeight);
                }
                else {
                    whThumb = {
                        w: img.width,
                        h: img.height
                    };
                }
                var left = Math.round((maxWidth - whThumb.w) / 2);
                var top = Math.round((maxHeight - whThumb.h) / 2);

                var canvas = document.querySelector('#scene');
                var ctx = canvas.getContext("2d");
                ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = true
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(this, 0, 0, img.width, img.height, left, top, whThumb.w, whThumb.h);
                if (paramFile.antiAliasing) {
                    ctx.drawImage(sceneStepDown(img, whThumb.w, whThumb.h), left, top, whThumb.w, whThumb.h);
                }
                if (callback) {
                    callback({
                        width: img.width,
                        height: img.height,
                        left: left,
                        top: top,
                        imgDrawnWidth: whThumb.w,
                        imgDrawnHeight: whThumb.h
                    });
                }

                img = null;
            };

            img.src = param.encUrl(src);

    }
}
/**
 * @des draw img on canvas after zoom
 * @paramFile paramFile
 * @paramFile callback
 */
function sceneDraw(paramFile, callback) {

    var width = paramFile.width;  //new width
    var height = paramFile.height; //new height
    var degrees, x, y;

    var src = paramFile.src;

    var img = new Image();

    img.onload = function() {

        var whThumb = {
                w: img.width,
                h: img.height
        };

        var left;
        var top;

        var canvas = document.querySelector('#scene');
        var ctx = canvas.getContext("2d");

        left = (paramFile.left != undefined) ? paramFile.left :  Math.round((canvas.width - width) / 2);
        top = (paramFile.top != undefined) ? paramFile.top : Math.round((canvas.height - height) / 2);

        ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = true
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (paramFile.rotate) {
            //rotate img
            x = canvas.width / 2;
            y = canvas.height / 2;

            degrees = paramFile.rotate * Math.PI / 180;; //degrees to radian

            ctx.translate(x, y);
            ctx.rotate(degrees);
            ctx.drawImage(this, 0, 0, img.width, img.height, -width / 2, -height / 2, width, height);
            ctx.rotate(-degrees);
            ctx.translate(-x, -y);
        }
        else {
            ctx.drawImage(this, 0, 0, img.width, img.height, left, top, width, height);
        }

        if (paramFile.antiAliasing) {
            ctx.drawImage(sceneStepDown(img, whThumb.w, whThumb.h), left, top, whThumb.w, whThumb.h);
        }
        if (callback) {
            callback({
                width: img.width,
                height: img.height,
                left: left,
                top: top,
                imgDrawnWidth: paramFile.width,
                imgDrawnHeight: paramFile.height
            });
        }

        img = null;
    };

    img.src = src;
}


/**
 *
 * @des scene render in few times for smoothness
 * @paramFile img
 * @paramFile tw
 * @paramFile th
 * @returns {Element}
 */
function sceneStepDown(img, tw, th) {

    var steps,
        oc = document.createElement('canvas'),
        ctx = oc.getContext('2d'),
        fc = document.createElement('canvas'),
        w = img.width,
        h = img.height;

    oc.width = w;
    oc.height = h;

    fc.width = tw;
    fc.height = th;

    if ((w / tw) > (h / th)) {
        steps = Math.ceil(Math.log(w / tw) / Math.log(2));
    } else {
        steps = Math.ceil(Math.log(h / th) / Math.log(2));
    }

    if (steps <= 1) {
        ctx = fc.getContext('2d');
        ctx.drawImage(img, 0, 0, tw, th);
        return fc;
    }

    ctx.drawImage(img, 0, 0);
    steps--;

    while(steps > 0) {

        w *= 0.5;
        h *= 0.5;
        ctx.drawImage(oc, 0, 0, w * 2, h * 2,
                          0, 0, w, h);
        steps--;
    }

    ctx = fc.getContext('2d'),
    ctx.drawImage(oc, 0, 0, w, h, 0, 0, tw, th);
    return fc;
}