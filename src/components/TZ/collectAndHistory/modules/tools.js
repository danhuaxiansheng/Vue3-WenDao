
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js"
import store from "@/store/index.js"


export function getShowTxt(params) {
    let txtList = [];
    params.expression && txtList.push('表达式：' + params.expression);
    txtList = txtList.concat(getFormatTxt(params.conditions))
    if (txtList[0] === '并且' || txtList[0] === '或者') {
        txtList.splice(0, 1)
    }
    return txtList.join(' ')
}


function getFormatTxt(conditions) {
    let txtList = [];
    (conditions || []).forEach(d => {
        if (d.conds && d.conds.length > 0) {
            let conds = getFormatTxt(d.conds)
            txtList = txtList.concat(conds)
        } else {
            // 查询栏列
            const searchBarColumns = store.state.searchBar.searchBarColumns;
            // 表格列
            const pageColumns = store.state.user.pageinfo.columns;
            let filterColumn = searchBarColumns.filter(f => f.field === d.field)[0];
            if (!filterColumn) {
                filterColumn = pageColumns.filter(f => f.field === d.field)[0] || {};
            }
            let title = filterColumn ? (filterColumn.displayText ?? filterColumn.label ?? filterColumn.title) : d.field;
            let dropDownList = filterColumn?.dropDownList ?? [];
            let value = d.value
            let op = searachBarTools.getModeTitle(d.op)?.text ?? ""
            if (dropDownList.length > 0) {
                let filterDrop = dropDownList.filter(l => l.key === d.value)[0]
                value = filterDrop?.value ?? d.value
            }
            txtList.push(d.connector === 'and' ? '并且' : '或者')
            txtList.push(title + op + value)
        }
    })
    return txtList
}


