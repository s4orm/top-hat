/**
 *
 * @type {{
 *
 *
 * }}
 */
var videoMixin = {

    methods: {

        clickVideo: function (src) {

            if (param.exec) {
                return;
            }
            //open stream
            if (src) {

                var width = zz.q('#block-video-scroll').offsetWidth;
                this.$set(this.video.scroll, 'width', width);


                var cmdStr = 'ffmpeg -i "'+src+'" 2>&1 | grep "Duration"';
                //var cmdStr = 'ffmpeg -i '+src+'';

                require('child_process').exec(cmdStr, function(err, stdout, stderr){
                    
                    if (!err) {

                        var matchDuration = stdout.match(/Duration:\s?([0-9:.]+)/);
                        var duration = 0;
                        var durationSec = 0;
                        var timeArr, h, m, s, ms;

                        if (matchDuration[1]) {

                            duration = matchDuration[1];
                            timeArr = duration.match(/[0-9]+/g); //["00", "11", "55", "95"] ["h", "m", "s", "ms"]

                            if (timeArr.length > 3) {

                                h = parseInt(timeArr[0], 10);
                                m = parseInt(timeArr[1], 10);;
                                s = parseInt(timeArr[2], 10);;
                                ms = parseInt(timeArr[3], 10);;

                                durationSec = (h * 60 * 60) + (m * 60) + s;
                            }
                        }

                        this.$set(this.video, 'duration', duration);
                        this.video.durationSec = durationSec;
                        this.videoStreamRun(src);
                    }
                }.bind(this));
            }
        },
        /**
        *
        * @param fullpath to file
        */
        videoStreamRun: function (src) {

            this.$set(this.flag, 'loadingVideoStream', true);

            if (!src) {
                return;
            }

            if (src.search(/"/) != -1) {
                console.log('error symbol: double quote');
                this.console('error symbol: double quote');
                return;
            }

            var src = src;//.replace(/'/img, "\\'");//.replace(/\s/img, '\\ ');
            var stream = this.video.stream;
            var http = 'http://'+stream;
            this.video.streamHTTP = http;
            var cmdStr = 'vlc --intf dummy --live-caching=6000 "'+src+'" -vvv input_stream --sout "'+this.video.param+'dst='+stream+'}"';

            param.exec = require('child_process').exec(cmdStr);

            this.video.streamStatus = false;

            setTimeout(function(){

                this.video.el = this.videoGet();
                //this.video.el.src = http;
                //this.video.el.play();
                //css animation (check video is load?)
                //this.videoLoadingStream();
                setTimeout(this.videoGetStatus.bind(this), 8000);
                this.videoSecCounter();
            }.bind(this), 1000);
        },

        /**
         * @des temporary function delete loading css animation after stream is load and video showing
         */
        videoLoadingStream: function() {

            if (this.video.el.currentTime > 0) {
                this.$set(this.flag, 'loadingVideoStream', false);
            }
            else {
                setTimeout(this.videoLoadingStream.bind(this), 400);
            }
        },

        videoSecCounter: function() {

            var sec = 0;

            sec = parseInt(this.video.el.currentTime, 10);
            if (this.video.streamStartTime > 0) {
                sec += this.video.streamStartTime;
            }

            this.$set(this.video, 'sec', sec);
            this.console('sec: ' + sec);

            //show current time in drag scroll
            var timeMinSec = zz.remainder(sec, 60);
            var timeCurrent = timeMinSec.int + ': ' + timeMinSec.remainder;

            this.$set(this.video, 'timeCurrent', timeCurrent);

            setTimeout(this.videoSecCounter.bind(this), 1000);
        },

        videoNextSecond: function (sec, set) {

            var sec = sec || 900;
            if (set) {
                //sec = sec
            }
            else {
                sec = this.video.sec + sec;
            }

            this.videoSecCounter(sec);

            zz.q('#sceneVideo').pause();
            this.videoStreamClear();

            this.video.streamStartTime = sec;
            var stream = this.video.stream + '/time='+sec;
            var http = 'http://'+stream;

            zz.q('#sceneVideo').src = http;
            this.video.streamHTTP = http;

            var cmdStr = 'vlc --intf dummy "'+this.scene.src+'" --start-time='+sec+' -vvv --sout "'+this.video.param+'dst='+stream+'}"';
            param.exec = require('child_process').exec(cmdStr);

            this.video.streamStatus = false;
            setTimeout(this.videoGetStatus.bind(this), 400);

        },

        videoGetStatus: function(){

            if (this.video.streamStatus === true) {
                return;
            }

            console.log('get status');
            var xhr = new XMLHttpRequest();

            xhr.open('GET', this.video.streamHTTP, true);
            xhr.onprogress = function () {

                if (200 == xhr.status) {
                    this.videoGetStatusCheck();
                    this.video.streamStatus = true;
                    xhr.abort();
                }
                else {
                    if (this.video.streamStatus === false) {
                        setTimeout(this.videoGetStatus.bind(this), 400);
                    }
                }
                xhr.abort();
            }.bind(this);

            xhr.send(null);
        },

        videoGetStatusCheck: function() {

            this.videoGet().src = this.video.streamHTTP;

            this.videoGet().play().catch(function(reason){
                setTimeout(function(){

                    this.videoGet().play();
                    this.video.streamStatus = false;

                }.bind(this), 1000);
            }.bind(this));


        },

        /**
         * @des kill process of video
         */
        videoStreamClear: function () {


            if (param.exec && param.exec.pid) {

                process.kill(param.exec.pid + 1);
                param.exec = null;
            }
        },

        videoParamReset: function () {

            this.$set(this.video, 'sec', 0);
            this.$set(this.video, 'duration', 0);
            this.$set(this.video, 'durationSec', 0);
            this.$set(this.video.scroll, 'left', 0);
        },

        videoNextSec: function (sec) {

            this.videoGet().currentTime += sec;
        },

        videoPrevSec: function (sec) {

            this.videoGet().currentTime -= sec;
        },

        videoStartPause: function () {

            var video = this.videoGet();
            if (video.paused) {
                video.play();
            }
            else {
                video.pause();
            }
        },

        videoFullscreen: function () {

            var video = this.videoGet();

            if (!this.video.fullscreen) {

                video.webkitRequestFullscreen();
                this.$set(this.video, 'fullscreen', true);
            }
            else {
                video.webkitExitFullScreen();
                this.$set(this.video, 'fullscreen', false);
            }
        },

        videoExitFullscreen: function () {

            var video = this.videoGet();

            video.webkitExitFullScreen();
            this.$set(this.video, 'fullscreen', false);
        },

        isVideoSupported: function (ext, type) {

            //if (param.exec && param.exec.pid) {
            //    process.kill(param.exec.pid + 1);
            //}

            var isSupported = false;
            if ('video' == type) {
                //var extVideoArr = ['mp4', 'ogg', 'avi', 'mkv', 'wmv', 'divx', 'flv'];
                //if (extVideoArr.indexOf(ext) != -1) {
                isSupported = true;
                //}
            }

            return isSupported;
        },


        /**
         *
         * @param ext - avi, mkv
         * @param src - file://fullpath/file.avi
         * @returns {boolean}
         */
        isVideoUnsupported: function (ext) {

            var isUnsupported = false;

            //var extVideoArr = ['avi', 'mkv', 'divx', 'wmv'];
            var extVideoArr = [];
            if (extVideoArr.indexOf(ext) != -1) {
                isUnsupported = true;
            }

            return isUnsupported;
        },

        videoStartPauseUnsuported: function () {

            var thumbShowed = this.getThumb();
            console.log(thumbShowed, 'clc');
            //this.videoStreamRun(thumbShowed.src);
        },

        videoStreamStop: function (){

            console.log(param.exec.pid);

            process.kill(param.exec.pid + 1);
        },


        videoScrollMouseMove: function (offset) {

            var scrollLeft = this.video.scroll.left + offset.left;
            var durationSec, newSec;

            if (scrollLeft < 0) {
                return;
            }

            if (scrollLeft > this.video.scroll.width) {
                return;
            }

            this.$set(this.video.scroll, 'left', scrollLeft);
            this.$set(this.video.scroll, 'active', true);


            /**
            scrollLeft - width;
            newSec - durationSec;
            */

            //newSec = this.video.scroll.left * this.video.durationSec / this.video.scroll.width;
            //console.log(newSec);

        },



    }
};