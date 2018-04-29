var imageProcessingMixin = {

    methods: {

        /**
         * @des Resize every image in folder and replace it
         * @dir Active dir (tmp dir or tree dir)
         */
        clickImageResize: function (callback) {

            var dir = this.$root.getActivePath();

            var widthXHeight = '2200x2200';
            var pathInput = dir.replace(/(\s+)/img, "\\$&");
            var pathOutput = pathInput+'/*.jpg';

            var cmdStr = 'mogrify -resize '+widthXHeight+' -path '+pathInput+' '+pathOutput;

            zz.window.confirm({title: lang.resize.images, des: lang.resize.images}, function () {

                require('child_process').exec(cmdStr, function (error, stdout, stderr) {

                    zz.window.alert({
                        title:lang.console.imagesResized,
                        timer:2000,
                        des: lang.console.imagesResized
                    }, undefined);

                    this.console(lang.console.imagesResized);

                    if (callback) {
                        callback();
                    }

                }.bind(this));

            }.bind(this));
        }
    }
}