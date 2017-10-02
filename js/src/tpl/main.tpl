<div id="start" class="start"></div>
<div id="app" class="app">

    <div class="top" v-bind:class="{hidden: isFullscreen}" @click="clickTopMenu($event)">
        <i class="ico ico-file-txt" data-type="clickCreateFile" :title="lang.file.create"></i>
        <i class="ico ico-new-dir" data-type="clickCreateDir" :title="lang.dir.create"></i>
        <i class="ico ico-history-back" data-type="clickHistoryBack" :title="lang.history.back"></i>
        <i class="ico ico-history-forward" data-type="clickHistoryForward" :title="lang.history.forward"></i>
        <i class="ico ico-zip" data-type="clickZip" :title="lang.pack"></i>
        <i class="ico ico-zip-cut-one" data-type="clickZipCutOne" :title="lang.archive.cutOne"></i>
        <i class="ico ico-zip-folders" data-type="clickZipFolders" :title="lang.archive.folders"></i>
        <i class="ico ico-anti-aliasing" v-bind:class="{ico_anti_aliasing_active: isAntiAliasing}" data-type="clickAntiAliasing" :title="lang.antiAliasing"></i>
        <i class="ico ico-rename" data-type="clickRename" :title="lang.rename"></i>
        <i class="ico ico-rename-group" data-type="clickRenameGroup" :title="lang.renameGroup"></i>
        <i class="ico ico-eps-stock" data-type="clickEpsStock" :title="lang.epsStock"></i>
        <i class="ico ico-eps-stock-create-folder" data-type="clickEpsStockCreateDir" :title="lang.epsStockCreateDir"></i>
        <i class="ico ico-rotate-counter" data-type="clickRotateCounter" :title="lang.rotate"></i>
        <i class="ico ico-rotate" data-type="clickRotate" :title="lang.rotate"></i>
        <b class="ico-separator"></b>
        <i class="ico ico-garbage" data-type="clickDelete" :title="lang.delete"></i>
        <input class="top__search" type="text" :title="lang.search.line" @keyup.enter="searchLineKeyUp($event)" :value="search.val">
    </div>

    <div class="middle">

        <div id="block-middle-left" class="middle__left" :style="{width: style.leftWidth + 'px'}">

            <div id="block-fullpath" class="fullpath" @click="clickDirFullpathSelect($event);setFocus('fullpath');" data-act="select">
                <b v-for="dir in fullpathArr" @click="clickTreeFullpathJump($event)" v-show="flag.show.dirFullpath == false">
                    <b class="fullpath__separator">/</b><b class="fullpath__dir-name" data-type="path" :data-path="dir.path">{{dir.name}}</b>
                </b>
                <input id="fullpath" :value="fullpath" type="text" class="fullpath__links" v-show="flag.show.dirFullpath" @keyup.enter="dirEnterFullpath($event)">
                <i class="ico ico-bookmark ico-bookmark__add" @click="clickBookmarkAdd" :title="lang.bookmarks.add"></i>

            </div>

            <div class="dir">

                <div class="dir__tab" @click="clickDirTab($event)">
                    <b class="dir__tab__item" :class="{dir__tab__item_active: isTreeTab('bookmarks')}" data-act="bookmarks">{{lang.treeTab.bookmarks}}</b>
                    <b class="dir__tab__item" :class="{dir__tab__item_active: isTreeTab('tree')}" data-act="tree">{{lang.treeTab.tree}}</b>
                </div>

                <div class="dir__content">

                    <div id="bookmarks" class="bookmarks" :class="{bookmarks_active: isTreeTab('bookmarks')}" @click="clickBookmarks($event)">
                        <div class="bookmarks__li" v-for="bookmark in bookmarks" data-act="goto" :data-fullpath="bookmark.fullpath" :title="bookmark.fullpath">{{bookmark.name}}<b class="bookmarks__li__close" :title="lang.delete" data-act="delete" :data-fullpath="bookmark.fullpath">✕</b></div>
                    </div>

                    <div id="block-tree" class="middle__left__tree" :class="{middle__left__tree_active: isTreeTab('tree')}" @click="clickFocus('tree')">

                        <ul id="tree" class="tree">
                            <tree :tree="tree" class="tree__item"></tree>
                        </ul>

                    </div>
                </div>
            </div>

            <div id="block-thumb" class="middle__left__thumb" @click="clickFocus('thumb')">
                <div class="thumbnails__scroll">
                    <div id="thumb-scroll" class="thumbnails__scroll__drag" v-bind:style="{ top: thumb.scroll.top + 'px', height: thumb.scroll.height + 'px' }" :class="{thumbnails__scroll__drag_active:thumb.scroll.active}" data-dd="thumb-scroll"></div>
                </div>

                <div class="middle__left__thumb__loading">
                    <div class="middle__left__thumb__sort" @click="clickThumbSort($event)">
                        <div class="middle__left__thumb__sort__by" data-act="name"><b class="sort_arrow">{{thumb.sort.name.arrow}}</b><b class="middle__left__thumb__sort__by_name" data-act="name">{{lang.sort.by.name}}</b></div>
                        <div class="middle__left__thumb__sort__by" data-act="date"><b class="sort_arrow">{{thumb.sort.date.arrow}}</b><b class="middle__left__thumb__sort__by_date" data-act="date">{{lang.sort.by.date}}</b></div>
                    </div>
                    <div class="middle__left__thumb__loading__total" v-bind:class="{middle__left__thumb__loading__line:loading.percent}">{{lang.file.file}}: {{numThumb}} {{lang.from}} {{loading.thumb.loaded}} ({{loading.thumb.total}}), {{lang.selected}}:{{thumb.selected.length}}</div>
                    <div class="loading_line" v-bind:style="{ width: loading.percent + '%' }"></div>
                </div>
                <div tabindex="0" id="thumb" class="thumbnails" @click="clickThumb($event)">

                    <div :id="('thumb-' + thumb.id)" class="thumbnails__item" data-dd="thumb" v-for="thumb in thumb.frame" :key="thumb.id" :data-id="thumb.id" :title="thumb.name" :class="{ thumbnails__item_selectMode: thumb.selectMode, thumbnails__item_selected: isShowed(thumb.id) }">
                        <i :class="{ thumbnails__item_marked: isThumbMarked(thumb.id) }"></i>
                        <canvas width="110" height="80" data-dd="thumb"></canvas>
                        <div class="thumbnails__item__name" data-dd="thumb">{{ thumb.title }}</div>
                    </div>

                </div>

                <div id="hidden" class="hidden">
                    <canvas id="thumb-hidden" class="thumb-hidden" width="110" height="80"></canvas>
                    <canvas id="canvas-hidden" class="canvas-hidden" width="300" height="300"></canvas>
                </div>
            </div>

        </div>
        <div id="middle-left-vl" class="middle__left__vl" data-dd="middle-vl"><div id="middle-left-vl-ghost" class="middle__left__vl" style="display: none;position: fixed;"></div></div>

        <div id="block-scene" class="middle__right" v-bind:class="{middle__right_selected: selected }" @click="clickFocus('scene')">

            <div class="scene-file" v-if="scene.type === 'txt'">
                <textarea id="sceneText" class="scene-file__text">{{scene.val}}</textarea>
                <input type="button" class="zz__window__btn" :value="lang.file.save" @click="saveFile">
            </div>

            <video id="sceneVideo" class="scene-video" controls width="100%" @click="videoStartPause" :src="scene.src" type="video/mp4" v-else-if="isVideoSupported(scene.ext, scene.type)"></video>
            <div v-else-if="isVideoUnsupported(scene.ext)" class="video-block">
                <div class="cssload-container video__loading" v-if="flag.loadingVideoStream">
                    <div class="cssload-loading"><i></i><i></i><i></i><i></i></div>
                </div>
                <video id="sceneVideo" class="scene-video" :class="{video__loading_bgHide: flag.loadingVideoStream}" width="100%" @click="clickVideo(scene.src)" src="" type="video/ogg" :title="lang.video.createStream" /></video>
                <div id="block-video-scroll" class="video__scroll">
                    <div id="video-scroll" class="video__scroll__drag" v-bind:style="{ left: video.scroll.left + 'px' }" :class="{video__scroll__drag_active: video.scroll.active}" data-dd="video-scroll"></div>
                    <div class="video__time-current">{{video.timeCurrent}} - {{video.duration}}</div>
                </div>
            </div>

            <img id="sceneGif" class="scene-gif" :src="scene.src" v-else-if="scene.ext === 'gif'" />
            <img id="sceneSvg" class="scene-svg" :src="scene.src" height="100%" v-else-if="scene.ext === 'svg'" />
            <canvas id="scene" class="scene" data-dd="sceneCanvas" :width="scene.width" :height="scene.height" v-else></canvas>
        </div>

    </div>

    <div class="bottom" v-bind:class="{hidden: isFullscreen}">
        <div class="cssload-container" v-if="flag.loading">
            <div class="cssload-loading"><i></i><i></i><i></i><i></i></div>
        </div>
        <div id="console" class="console" v-bind:class="{console_selected: selected}"></div>
    </div>

    <div class="search" :class="{search_turnoff: search.turnOff}" v-if="search.val != ''" @click="clickSearch">
        <i class="search__turnoff" data-act="turnOff">&#9660;</i>
        <i class="search__close" data-act="close">✕</i>
        <b class="search__notfound" v-if="search.notfound">{{lang.search.notfound}}</b>
        <ul class="search__list">
            <li class="search__list__item" v-for="(item, key) in search.list">

                <i class="search__dir" data-act="group" :data-fullpath="item.dir"></i>
                <span class="search__list__item__dir" data-act="item" :data-fullpath="item.dir">{{item.dir}}</span>
                <b class="search__list__item__total" :class="{search__list__item__total_open: item.showFiles}" data-act="group" :data-fullpath="item.dir">{{item.total}}</b>

                <ul class="search__list__item__file" v-if="item.showFiles">
                    <li v-for="file in item.file">
                        <span class="search__list__item__file__item" data-act="file" :data-dir="item.dir" :data-fullpath="file">{{file}}</span>
                    </li>
                </ul>
            </li>
        </ul>
    </div>

</div>

<script type="text/x-template" id="tree-item-template">
    <li>
        <div :id="tree.id" class="tree__name" :class="{tree__branch__open: tree.openFolder}">
            <div class="tree__title">

                <i class="ico ico-tree-dir ico_tree_zip" v-if="isZipDefault" v-show="isZipDefault" :title="lang.unpack" @click="clickZipUnpack" data-act="clickUnzip"></i>
                <i class="tree__zip-repack" v-else-if="isZipOpen" v-show="isZipOpen" @click="clickZipRepack" :title="lang.pack" data-act="repack"></i>
                <i class="tree__zip-repacked" v-else-if="isZipPacked" v-show="isZipPacked" :title="lang.packed"></i>
                <i class="ico ico-tree-dir" :class="{ico_tree_dir_open: isSelected}" data-act="clickReloadDir" @click="clickIcoDir" v-else></i>
                <i class="tree__zip-unpack" v-else-if="isZipDefault" v-show="isZipDefault"></i>
                <i class="ico_tree_zip_loading" v-if="isUnpacking"></i>

                <span class="tree__title__name" data-act="clickDirName" data-dd="tree" :data-id="tree.id" @click="clickDirName" :title="tree.name" :class="{tree__branch__end: isSelected}">{{tree.name}}</span>
                <span class="tree__file-size" v-if="tree.size" data-name="size">{{tree.size}}</span>

            </div>
        </div>
        <ul class="tree" v-show="openFolder">
            <tree class="tree__item" v-for="tree in tree.children" :tree="tree"></tree>
        </ul>
    </li>
</script>