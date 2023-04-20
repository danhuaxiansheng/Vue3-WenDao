/**
 * 全屏界面
 */
export const viewfullscreen = () => {
    let isFull = !!(document.webkitIsFullScreen || document.fullscreenElement);
    // 获取icon节点替换类名
    let iconFullscreenNode = document.getElementsByClassName('icon-fullscreen');
    let iconFullscreenExitNode = document.getElementsByClassName('icon-fullscreen-exit');

    if (!isFull) {
        if (iconFullscreenNode.length) {
            iconFullscreenNode[0].className = 'iconfont icon-fullscreen-exit';
        }
        let elemBody = document.body;
        if (elemBody.webkitRequestFullScreen) {
            elemBody.webkitRequestFullScreen();
        } else if (elemBody.mozRequestFullScreen) {
            elemBody.mozRequestFullScreen();
        } else if (elemBody.requestFullScreen) {
            elemBody.requestFullscreen();
        } else {
            // 浏览器不支持全屏API或已被禁用
        }
    } else {
        if (iconFullscreenExitNode.length) {
            iconFullscreenExitNode[0].className = 'iconfont icon-fullscreen';
        }
        let elem = document;
        if (elem.webkitCancelFullScreen) {
            elem.webkitCancelFullScreen();
        } else if (elem.mozCancelFullScreen) {
            elem.mozCancelFullScreen();
        } else if (elem.cancelFullScreen) {
            elem.cancelFullScreen();
        } else if (elem.exitFullscreen) {
            elem.exitFullscreen();
        } else {
            // 浏览器不支持全屏API或已被禁用
        }
    }
};