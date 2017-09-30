
/**
 * @des Return max width and height inscribed in a certain rectangle,limited maxWidth, maxHeight. preserves the proportions
 * @param srcWidth
 * @param srcHeight
 * @param maxWidth
 * @param maxHeight
 * @returns {{w: number, h: number}}
 */
function calculateAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return {w: Math.round(srcWidth * ratio), h: Math.round(srcHeight * ratio)};
}

/**
 * @des create thumbnail
 * @param callback
 */
function thumb(item, maxWidth, maxHeight, callback) {

    var id = item.id;
    var src = item.src;
    var type = item.type;
    var ctx, canvas, left, top, whThumb;

    canvas = document.querySelector('#thumb-' + id + ' canvas');

    if (!canvas) {
        canvas = document.querySelector("#thumb-hidden");
    }

    ctx = canvas.getContext("2d");

    switch (type) {

        case 'img':

            if (['jpeg', 'jpg', 'png', 'gif', 'svg'].indexOf(item.ext) != -1) {
                var img = new Image();

                img.onload = function () {

                    if ((img.width < maxWidth) && (img.height < maxHeight)) {
                        whThumb = {w: img.width, h: img.height};
                    }
                    else {
                        whThumb = calculateAspectRatio(img.width, img.height, maxWidth, maxHeight);
                    }

                    left = (canvas.width - whThumb.w) / 2;
                    top = (canvas.height - whThumb.h) / 2;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, img.width, img.height, left, top, whThumb.w, whThumb.h);

                    img = null;

                    if (callback) {
                        callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    }
                };

                img.onerror = function () {

                    console.log(item, 'error load src:', img.src);

                    if (callback) {

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.font = '12px sans-serif';
                        ctx.fillStyle = '#797979';
                        ctx.fillText('error', 46, 40);

                        callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    }
                }

                img.setAttribute('src', param.encUrl(src)); //fix file protocol bag
            }

            break;

        case 'adobe':

            /**
             * @des get ai, eps img data base64 which content from binary jpeg (jfif)
             * @param arr
             * @returns {{}}
             */
            function getPreviewAdobe(arr) {

                var str = '';
                var param = {};

                for (var i = 0; i < arr.length; i++) {

                    str = arr[i];

                    if (str.search(/<xmpGImg:image>/) != -1) {
                        param['imgData'] = str.replace('<xmpGImg:image>', '').replace('</xmpGImg:image>', '').replace(/^\s+|\s+$/, '');
                    }
                    if (str.search(/<xmpGImg:width>/) != -1) {
                        param['width'] = str.replace('<xmpGImg:width>', '').replace('</xmpGImg:width>', '').replace(/^\s+|\s+$/, '');
                    }
                    if (str.search(/<xmpGImg:height>/) != -1) {
                        param['height'] = str.replace('<xmpGImg:height>', '').replace('</xmpGImg:height>', '').replace(/^\s+|\s+$/, '');
                    }
                }

                return param;
            }

            if (('ai' == item.ext) || ('eps' == item.ext)) {

                fs.readFile(item.path, function (err, buf) {

                    if (err) {
                        return;
                    }

                    var array = buf.toString().split('\n');

                    var param = getPreviewAdobe(array);

                    if (!param.imgData) {
                        console.log('error loading img data:'+item.path);
                        callback(false);
                        return;
                    }

                    var imgBase64 = "data:image/jpeg;base64," + param.imgData + "";

                    zz.q("#hidden").insertAdjacentHTML('afterbegin', '<img id="imgAi' + item.id + '" src="' + imgBase64 + '">');

                    var imgAi = zz.q('#imgAi' + item.id);

                    var img = new Image();

                    img.onload = function () {

                        //preview on scene cache
                        var canvasHidden = document.querySelector("#canvas-hidden");
                        canvasHidden.width = param.width;
                        canvasHidden.height = param.height;
                        var ctxHidden = canvasHidden.getContext("2d");

                        ctxHidden.clearRect(0, 0, canvasHidden.width, canvasHidden.height);
                        ctxHidden.drawImage(img, 0, 0, img.width, img.height);

                        param.imgData = ctxHidden.getImageData(0, 0, canvasHidden.width, canvasHidden.height);

                        if ((img.width < maxWidth) && (img.height < maxHeight)) {
                            whThumb = {w: img.width, h: img.height};
                        }
                        else {
                            whThumb = calculateAspectRatio(img.width, img.height, maxWidth, maxHeight);
                        }

                        left = (canvas.width - whThumb.w) / 2;
                        top = (canvas.height - whThumb.h) / 2;

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, img.width, img.height, left, top, whThumb.w, whThumb.h);

                        img = null;
                        //imgAi.parentNode.removeChild(imgAi);

                        if (callback) {
                            callback(ctx.getImageData(0, 0, canvas.width, canvas.height), param);
                        }
                    }
                    img.src = imgAi.src;
                });
            }

            if ('pdf' == item.ext) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '12px sans-serif';
                ctx.fillStyle = '#797979';
                ctx.fillText(type, 46, 40);

                if (callback) {
                    callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
                }
            }
            if ('psd' == item.ext) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '12px sans-serif';
                ctx.fillStyle = '#797979';
                ctx.fillText(type, 46, 40);

                if (callback) {
                    callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
                }
            }

            break;

        default:

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#797979';
            ctx.fillText(type, 46, 40);

            if (callback) {
                callback(ctx.getImageData(0, 0, canvas.width, canvas.height));
            }
    }
}

/**
 * @des create thumbnail from Cache
 * @param callback
 */
function thumbFromData(id, imgData, callback) {

    if (!imgData) {
        return;
    }

    var canvas = document.querySelector('#thumb-'+id+' canvas');

    if (!canvas) {
        return;
    }

    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgData, 0, 0);

    if (callback) {
        callback();
    }
}