const getters = {
    token: state => state.user.token,
    project1126: state => state.user.projectUser == '1126',
    // isLock: state => state.user.isLock,
    // lockPassword: state => state.user.lockPassword,
    // browserHeaderTitle: state => state.user.browserHeaderTitle,
    isFullScreen: state => state.common ? state.common.isFullScreen : state.fullScreen.isFullScreen,
    visitedViews: state => state.tagsView.visitedViews,
    cachedViews: state => state.tagsView.cachedViews,
    checkeLists: state => state.tz.checkeLists,
    getSystemLogo: state => state.tz.systemLogo,

    //通用组件getters by-zhp
    $table: state => state.plug.table,           // 表格
    $toolBar: state => state.plug.toolBar,       // 工具栏
    $searchBar: state => state.plug.searchBar,   // 查询栏
    $tabContent: state => state.plug.tabContent, // 侧边栏
    $pageLayout: state => state.plug.pageLayout, // 公共模板
    pageinfo: state => state.user.pageinfo,      // 当前界面信息
}

export default getters