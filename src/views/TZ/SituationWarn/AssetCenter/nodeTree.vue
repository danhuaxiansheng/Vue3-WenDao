<template>
  <div class="node_tree element-page__scroll">
    <el-tree
      show-checkbox
      default-expand-all
      ref="nodeTree"
      :indent="24"
      icon-class="el-icon-arrow-right"
      :data="menuList"
      :props="defaultProps"
      node-key="id"
      draggable
      :allow-drop="allowDrop"
      @node-drop="handlerDrop"
      @check="updateNodeChange()"
    >
      <!-- <p class="menu_item_container" slot-scope="{ node, data }">
        <span class="menu_name ellipsis">{{ node.label }}</span>
        <template v-if="data.id != 'notGroupid'">
          <i
            v-if="data.level < 5"
            class="menu_add el-icon-plus"
            title="新增"
            @click.stop="editNode(data, 'add')"
          ></i>
          <i
            class="menu_edit el-icon-edit"
            title="编辑"
            @click.stop="editNode(data, 'edit')"
          ></i>
          <i
            v-if="!data.isRoot"
            class="menu_del el-icon-delete"
            title="删除"
            @click.stop="deleteTreeNode(data)"
          ></i>
        </template>
      </p> -->
    </el-tree>
    <el-dialog
      :title="title"
      v-model:visible="layerShow"
      width="360px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <el-form
        :model="editData"
        :rules="rules"
        ref="ruleForm"
        @submit.prevent
        label-width="100px"
      >
        <el-form-item label="分组名称：" prop="groupname" name="groupname">
          <el-input
            class="group_name"
            v-model.trim="editData.groupname"
            placeholder="请输入分组名称"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button size="small" type="info" @click="layerShow = false"
          >取消</el-button
        >
        <el-button size="small" type="primary" @click="saveNodeData"
          >确定</el-button
        >
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import {
  menuTree,
  addTreeNode,
  editTreeNode,
  deleteTreeNode,
  updateTreeNode,
} from "@API/TZ/AssetCenter.js";
export default {
  name: "nodeTree",
  props: {
    nodepicked: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    menuList: [],
    timer: null,
    defaultProps: {
      children: "children",
      label: "groupname",
    },
    editNodeData: {}, // 当前操作的节点
    editType: "add", // 新增: add、 修改: edit
    // 编辑弹窗
    title: "",
    layerShow: false,
    editData: {},
    rules: {
      groupname: [
        { message: "分组名称不能为空", required: true, trigger: "blur" },
        { min: 2, max: 12, message: "长度为2-12个字符", trigger: "blur" },
      ],
    },
  }),
  async mounted() {
    await this.getMenuTree();
    // 没传入选中节点时默认选中所有
    let setCheckedKeys = this.nodepicked.length
      ? this.nodepicked
      : this.menuList.length
      ? [this.menuList[0].id]
      : [];
    this.$refs.nodeTree.setCheckedKeys(setCheckedKeys);
    // 节点构建成功后触发onload事件通知父组件加载完成
    this.$nextTick(() => {
      this.updateNodeChange("onload");
    });
  },
  methods: {
    allowDrop(draggingNode, dropNode, dropType) {
      let errorText = "";
      if (draggingNode.data.groupname == "未分组") {
        errorText = "该分组不支持移动！";
      } else if (dropNode.data.groupname == "未分组") {
        errorText = "不支持将分组移动到该分组下！";
      } else {
        // 判断是否当前分组下已经存在同名分组
        // 往自身父元素拖动，直接禁止
        if (draggingNode.parent.data.id == dropNode.data.id) return false;
        let brotherNode = dropNode?.childNodes ?? [],
          groupnames = brotherNode.map((item) => item?.data?.groupname);
        if (groupnames.includes(draggingNode.data.groupname)) {
          errorText = "目标父分组下已存在相同名称分组！";
        }
      }
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        errorText && this.$message.error(errorText);
      }, 300);
      if (errorText) return false;
      else if (dropNode.data.groupname == "中国网安") {
        return dropType == "inner";
      } else {
        return true;
      }
    },
    handlerDrop(draggingNode, dropNode, dropType) {
      let pid =
        dropType == "inner" ? dropNode.data.id : dropNode.parent.data.id;
      updateTreeNode({
        groupname: draggingNode.data.groupname,
        id: draggingNode.data.id,
        pid,
      }).then(() => {
        this.$message.success("分组移动成功！");
      });
    },
    updateNodeChange(eventType = "change") {
      let allCheckedKeys = this.$refs.nodeTree.getCheckedKeys();
      const notGroupid = allCheckedKeys.includes("notGroupid");
      let checkedKeys = allCheckedKeys.filter((item) => item != "notGroupid");
      if (!allCheckedKeys.length)
        return this.$message.warning("请至少选中一个分组！");
      this.$emit("update:nodepicked", checkedKeys);
      this.$emit("update:notGroupid", notGroupid);
      this.$emit(eventType, checkedKeys);
    },
    editNode(data, type) {
      this.editNodeData = data;
      this.editType = type;
      this.layerInit();
    },
    // 获取节点数据
    getMenuTree() {
      return new Promise((rev) => {
        menuTree({ id: 1 })
          .then((res) => {
            this.$store.commit(
              "tz/set_node_tree",
              JSON.parse(JSON.stringify(res.data)) || {}
            );
            res.data.isRoot = true;
            res.data.children.push({
              id: "notGroupid",
              groupname: "未分组",
              pid: -999,
            });
            this.menuList = this.buildMenuTree([res.data]);
            rev();
          })
          .catch((err) => {
            console.log(err);
          });
      });
    },
    // 构建el-tree的参数
    buildMenuTree(menuList, level = 0) {
      level++;
      let menuArr = [];
      menuList.forEach((item) => {
        let menu = { ...item, level };
        if (item.children && item.children.length) {
          menu.children = this.buildMenuTree(item.children, level);
        }
        menuArr.push(menu);
      });
      return menuArr;
    },
    // 成功添加或编辑节点数据
    async nodeDataChanged() {
      // 节点有修改，更新节点选中状态
      let checkedKeys = this.$refs.nodeTree.getCheckedKeys(true);
      await this.getMenuTree();
      this.$nextTick(() => {
        this.$refs.nodeTree.setCheckedKeys(checkedKeys);
      });
      this.editNodeData = {};
      this.editType = "";
    },
    // 初始化 新增/修改 弹窗
    layerInit() {
      if (this.editType === "add") {
        this.editData = {
          pid: this.editNodeData.id,
          groupname: "",
        };
        this.title = `在“${this.editNodeData.groupname}”下新增分组`;
      } else {
        this.editData = {
          id: this.editNodeData.id,
          pid: this.editNodeData.pid,
          groupname: this.editNodeData.groupname,
        };
        this.title = `编辑“${this.editNodeData.groupname}”分组名称`;
      }
      this.layerShow = true;
    },
    // 弹窗保存按钮事件
    saveNodeData() {
      this.$refs.ruleForm.validate((valid) => {
        valid &&
          this[this.editType == "add" ? "addTreeNode" : "editTreeNode"]();
      });
    },
    // 新增节点
    addTreeNode() {
      addTreeNode(this.editData).then((_) => {
        this.$message.success("添加成功！");
        this.nodeDataChanged({ ...this.editData, id: _.data });
        this.layerShow = false;
      });
    },
    // 修改节点
    editTreeNode() {
      editTreeNode(this.editData).then(() => {
        this.$message.success("修改成功！");
        this.nodeDataChanged({ ...this.editData });
        this.layerShow = false;
      });
    },
    // 删除节点
    deleteTreeNode(data) {
      this.$confirm(
        `分组“${data.groupname}”及下属分组将被永久删除，是否继续？`,
        "提示",
        {
          type: "warning",
          customClass: "wd_dailog",
        }
      ).then(() => {
        deleteTreeNode({ id: data.id }).then(async () => {
          this.$message.success("删除成功！");
          // this.$refs.nodeTree.remove(data);
          let checkedKeys = this.$refs.nodeTree
            .getCheckedKeys()
            .filter((item) => item != data.id);
          await this.getMenuTree();
          this.$nextTick(() => {
            this.$refs.nodeTree.setCheckedKeys(checkedKeys);
          });
        });
      });
    },
  },
  beforeUnmount() {
    this.$store.commit("tz/set_node_tree", {});
  },
};
</script>

<style lang="scss" scoped>
.node_tree {
  padding: 16px 14px 4px;
  z-index: 2;
  p.menu_item_container {
    min-width: 0;
    border: 1px solid transparent;
    padding: 0 2px;
    border-radius: 2px;
    line-height: 24px;
    display: flex;
    flex-grow: 1;
    align-items: center;
    user-select: none;
    > * {
      cursor: pointer;
    }
    span.menu_name {
      min-width: 0;
      flex-shrink: 1;
      margin-right: 4px;
    }
    i {
      display: none;
      color: #666;
      margin: 0 2px;
      font-size: 16px;
      &:hover {
        color: $highColor;
      }
    }
    i.menu_add {
      font-size: 19px;
    }
    &:hover i {
      display: inline;
    }
  }
  .el-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
    p.menu_item_container i {
      display: inline;
    }
  }
}
.el-form-item {
  margin: 14px 0;
  .group_name {
    width: 212px;
  }
}
</style>
