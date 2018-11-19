<template>

  <imp-panel>
    <h3 class="box-title" slot="header" style="width: 100%;">
      <el-button type="primary" icon="plus" @click="newAdd">新增</el-button>
      <!-- <el-button type="danger" icon="delete" @click="batchDelete">删除</el-button> -->

    </h3>
    <el-row slot="body" :gutter="24" style="margin-bottom: 20px;">
      <el-col :span="6" :xs="24" :sm="24" :md="6" :lg="6" style="margin-bottom: 20px;">
        <el-table highlight-current-row :data="roleTree" ref="roleTree" border style="width: 100%" @row-click="clickRow" @selection-change="handleSelectionChange">
          <!--checkbox 适当加宽，否则IE下面有省略号 https://github.com/ElemeFE/element/issues/1563-->
          <el-table-column prop="id" type="index" label="序号" width="150">
          </el-table-column>
          <el-table-column prop="name" label="角色名称">
          </el-table-column>
          <el-table-column prop="description" label="描述">
          </el-table-column>

        </el-table>
        <!-- <el-tree v-if="roleTree"
                 :data="roleTree"
                 ref="roleTree"
                 show-checkbox
                 highlight-current
                 :render-content="renderContent"
                 @node-click="handleNodeClick" clearable node-key="id" :props="defaultProps"></el-tree> -->
      </el-col>
      <el-col :span="18" :xs="24" :sm="24" :md="18" :lg="18">
        <el-card class="box-card">
          <div class="text item">
            <el-form :model="form" ref="form">
              <el-form-item label="名称" :label-width="formLabelWidth">
                <el-input v-model="form.name" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="描述" :label-width="formLabelWidth">
                <el-input v-model="form.description" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="" :label-width="formLabelWidth">
                <el-button type="primary" @click="onSubmit" v-text="form.id?'修改':'新增'"></el-button>
                <el-button type="info" @click="settingResource($event,form.id)" icon="setting" v-show="form.id && form.id!=null">配置资源
                </el-button>
                <el-button type="danger" @click="deleteSelected(form.id)" icon="delete" v-show="form.id && form.id!=null">删除
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>

        <el-dialog title="配置资源" v-model="dialogVisible" size="tiny">
          <div class="select-tree">
            <el-scrollbar tag="div" class='is-empty' wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list">
              <el-tree :data="resourceTree" ref="resourceTree" show-checkbox check-strictly node-key="id" v-loading="dialogLoading" :props="defaultProps">
              </el-tree>
            </el-scrollbar>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="configRoleResources">确 定</el-button>
          </span>
        </el-dialog>
      </el-col>
    </el-row>
  </imp-panel>

</template>
<script>
import panel from "../../components/panel.vue";
import selectTree from "../../components/selectTree.vue";
import treeter from "../../components/treeter";
import * as sysApi from "../../services/sys";

import * as api from "../../api";

export default {
  mixins: [treeter],
  components: {
    "imp-panel": panel,
    "el-select-tree": selectTree
  },
  data() {
    return {
      dialogLoading: false,
      dialogVisible: false,
      formLabelWidth: "100px",
      defaultProps: {
        children: "children",
        label: "name",
        id: "id"
      },
      roleTree: [],
      resourceTree: [],
      maxId: 700000,
      form: {
        id: null,
        name: "",
        description: ""
      }
    };
  },
  methods: {
    clickRow(row) {
      this.form = row;
      this.$refs.roleTree.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      // 选中的行数据
      // console.log(JSON.stringify(val));
    },
    configRoleResources() {
      let id = this.form.id;
      let checkedKeys = this.$refs.resourceTree.getCheckedKeys();

      this.$http.post("/sys/role/setMenus?roleId=" + this.form.id + "&menuIds="+checkedKeys.join(',')).then(res=>{
         this.$message('修改成功');
        this.dialogVisible = false;
      })
      // this.$http.get(api.SYS_SET_ROLE_RESOURCE + "?roleId=" + this.form.id + "&menuIds="+checkedKeys.join(','))
      //   .then(res => {
      //     this.$message('修改成功');
      //     this.dialogVisible = false;
      //   })
    },
    handleNodeClick(data) {
      this.form = data;
    },
    newAdd() {
      this.form = {
        id: null,
        name: "",
        description: ""
      };
    },
    batchDelete() {
      var checkKeys = this.$refs.roleTree.getCheckedKeys();
      if (checkKeys == null || checkKeys.length <= 0) {
        this.$message.warning("请选择要删除的资源");
        return;
      }
      this.$confirm("确定删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$http
          .get(api.SYS_ROLE_DELETE + "?roleIds=" + checkKeys.join(","))
          .then(res => {
            this.$message("操作成功");
            this.load();
          })
          .catch(e => {
            this.$message("操作成功");
            console.log(checkKeys);
            this.batchDeleteFromTree(this.roleTree, checkKeys);
          });
      });
    },
    onSubmit() {
      this.form.parentId = this.form.parentId;
      this.$http
        .post(api.SYS_ROLE_ADD, this.form)
        .then(res => {
          if (!this.form.id) {
            this.appendTreeNode(this.roleTree, res.data);
            this.form.id = res.data.id;
          }
        })
        .catch(e => {
          this.maxId += 1;
          this.$message("操作成功");
          this.form.id = this.maxId;
          var ddd = {
            id: this.form.id,
            name: this.form.name,
            description: this.form.description
          };
          this.appendTreeNode(this.roleTree, ddd);
          this.roleTree.push({});
          this.roleTree.pop();
        });
    },
    deleteSelected(id) {
      this.$confirm("确定删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$http
          .get(api.SYS_ROLE_DELETE + "?id=" + id)
          .then(res => {
            console.log(2)
            console.log(JSON.stringify(res))
            this.$message("操作成功");
            this.deleteFromTree(this.roleTree, id);
            this.newAdd();
          })
      });
    },
    load() {
      this.$http
        .get("/sys/role/list")
        .then(res => {
          this.roleTree = res.data;
        })
        .catch(err => {});
      // sysApi.roleList().then(res => {
      //     this.roleTree = [];
      //     this.roleTree.push(...res)
      //   })
    },
    renderContent(h, { node, data, store }) {
      return (
        <span>
          <span>
            <span>{node.label}</span>
          </span>
          <span class="render-content">
            <i
              class="fa fa-wrench"
              title="配置资源"
              on-click={e => this.settingResource(e, data.id)}
            />
            <i
              class="fa fa-trash"
              on-click={() => this.deleteSelected(data.id)}
            />
          </span>
        </span>
      );
    },
    settingResource(event, id) {
      event.stopPropagation();
      this.dialogVisible = true;
      if (this.resourceTree == null || this.resourceTree.length <= 0) {
        this.dialogLoading = true;
        this.$http.get("/sys/menu/all").then(res => {
          this.dialogLoading = false;
          this.resourceTree = res.data;
        });
        // sysApi.resourceList()
        //   .then(res => {
        //     this.dialogLoading = false;
        //     this.resourceTree = res;
        //   })
      }
      this.$http
        .get("/sys/role/menuIds?id=" + id)
        .then(res => {
          this.$refs.resourceTree.setCheckedKeys(res.data);
        })
        .catch(err => {});
      // this.$http.get(api.SYS_ROLE_RESOURCE + "?id=" + id)
      //   .then(res => {
      //     this.$refs.resourceTree.setCheckedKeys(res.data);
      //   }).catch(err=> {

      // })
    }
  },
  created() {
    this.load();
  }
};
</script>

<style>
.render-content {
  float: right;
  margin-right: 20px;
}

.render-content i.fa {
  margin-left: 10px;
}

.render-content i.fa:hover {
  color: #e6000f;
}

.select-tree .el-scrollbar.is-empty .el-select-dropdown__list {
  padding: 0;
}

.select-tree .el-scrollbar {
  border: 1px solid #d1dbe5;
}

.select-tree .el-tree {
  border: 0;
}
</style>
