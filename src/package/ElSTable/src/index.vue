/** 表格优化组件 集成饿了么原有事件、方法以及使用方式 额外传入 columns
优化每一列的传入 默认单行显示 超出 ... 多级表头 该列添加属性 children
值的格式同columns 若要屏幕不出现滚动条，路由菜单根节点 添加 id="main"
组件添加传入属性fix-window */
<script>
import Vue from 'vue'
import { 
  Table,
  TableColumn,
 } from 'element-ui';
 Vue.use(Table)
 Vue.use(TableColumn)
// 表格 单元格默认设置 可在 columns 对应列传入相应属性
const RESIZEABLE = true; // resizable: true 默认用户可调整单元格尺寸
const SHOWOVERFLOWTOOLTIP = true; // show-overflow-tooltip: true 默认单元格一行 不换行 超出显示...
export default {
  name: "ElSTable",
  props: {
    tableKey: {
      type: Number | String,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    "summary-ahead": {
      // show-summary 为true 显示合计时， 若传了此参数为true 则合计显示在第一行 为false 则在最后一行
      type: Boolean,
      default: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    height: {
      type: String | Number,
      default: undefined,
    },
    "max-height": {
      type: String | Number,
      default: undefined,
    },
    stripe: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: undefined,
    },
    fit: {
      type: Boolean,
      default: true,
    },
    "show-header": {
      type: Boolean,
      default: true,
    },
    "highlight-current-row": {
      type: Boolean,
      default: false,
    },
    "current-row-key": {
      type: String | Number,
      default: undefined,
    },
    "row-class-name": {
      type: Function | String,
      default: undefined,
    },
    "row-style": {
      type: Function | Object,
      default: undefined,
    },
    "cell-class-name": {
      type: Function | String,
      default: undefined,
    },
    "cell-style": {
      type: Function | Object,
      default: undefined,
    },
    "header-row-class-name": {
      type: Function | String,
      default: undefined,
    },
    "header-row-style": {
      type: Function | Object,
      default: undefined,
    },
    "header-cell-class-name": {
      type: Function | String,
      default: undefined,
    },
    "header-cell-style": {
      type: Function | Object,
      default: undefined,
    },
    "row-key": {
      type: Function | String,
      default: undefined,
    },
    "empty-text": {
      type: String,
      default: "暂无数据",
    },
    "default-expand-all": {
      type: Boolean,
      default: false,
    },
    "expand-row-keys": {
      type: Array,
      default: undefined,
    },
    "default-sort": {
      type: Object,
      default: () => {
        return { order: "ascending" };
      },
    },
    "tooltip-effect": {
      type: String,
      default: undefined,
    },
    "show-summary": {
      type: Boolean,
      default: false,
    },
    "sum-text": {
      type: String,
      default: "合计",
    },
    "summary-method": {
      type: Function,
      default: undefined,
    },
    "span-method": {
      type: Function,
      default: undefined,
    },
    "select-on-indeterminate": {
      type: Boolean,
      default: true,
    },
    indent: {
      type: Number,
      default: 16,
    },
    lazy: {
      type: Boolean,
      default: undefined,
    },
    load: {
      type: Function,
      default: undefined,
    },
    "tree-props": {
      type: Object,
      default: () => {
        return { hasChildren: "hasChildren", children: "children" };
      },
    },
    // "fix-window": { // 表格固定高度
    //   type: Boolean,
    //   default: false
    // }
  },

  data() {
    return {
      tableHeight: undefined,
      minHeight: 150, // 表格最小高度
      key: 1,
      observe: undefined, // 监听页面对象
      fixColumns: [], // 固定列处理后
    };
  },

  render(h) {
    const { columns, height, ...tableAttr } = this._props;
    const selection = this.visibleColumns.find(
      (item) => item.type === "selection"
    );
    const tHeaders = this.visibleColumns.filter(
      (item) => item.type != "selection"
    );
    const theHeight = this.fixWindow ? this.tableHeight : this.height;
    const innerDom = [];
    if (selection) {
      innerDom.push(
        h("el-table-column", {
          key: "selection",
          props: { resizable: RESIZEABLE, align: "center", ...selection },
        })
      );
    }
    this.renderTpl(h, tHeaders, innerDom);

    return h(
      "el-table",
      {
        ref: "table",
        key: this.theTableKey,
        class: { summary_ahead: this.showSummary && this.summaryAhead },
        props: { ...tableAttr, maxHeight: theHeight },
        on: {
          select: (...arg) => this.handEvent("select", ...arg),
          "select-all": (...arg) => this.handEvent("select-all", ...arg),
          "selection-change": (...arg) =>
            this.handEvent("selection-change", ...arg),
          "cell-mouse-enter": (...arg) =>
            this.handEvent("cell-mouse-enter", ...arg),
          "cell-mouse-leave": (...arg) =>
            this.handEvent("cell-mouse-leave", ...arg),
          "cell-click": (...arg) => this.handEvent("cell-click", ...arg),
          "cell-dblclick": (...arg) => this.handEvent("cell-dblclick", ...arg),
          "row-click": (...arg) => this.handEvent("row-click", ...arg),
          "row-contextmenu": (...arg) =>
            this.handEvent("row-contextmenu", ...arg),
          "row-dblclick": (...arg) => this.handEvent("row-dblclick", ...arg),
          "header-click": (...arg) => this.handEvent("header-click", ...arg),
          "header-contextmenu": (...arg) =>
            this.handEvent("header-contextmenu", ...arg),
          "sort-change": (...arg) => this.handEvent("sort-change", ...arg),
          "filter-change": (...arg) => this.handEvent("filter-change", ...arg),
          "current-change": (...arg) =>
            this.handEvent("current-change", ...arg),
          "header-dragend": (...arg) =>
            this.handEvent("header-dragend", ...arg),
        },
      },
      innerDom
    );
  },

  created() {
    this.fixColumns = this.columns.map((item, index) => {
      if (item.fixed) {
        item["class-name"] =
          "fix_column " + (item.fixed == "left" ? "fix_left" : "fix_right");
        item.fixed = false;
        if (item.fixed != "left" && this.columns[index - 1]) {
          const preRow = this.columns[index - 1];
          preRow["class-name"] = "no_border_r";
        }
      }
      return item;
    });
  },
  computed: {
    theTableKey: function () {
      const theHeight = this.fixWindow ? this.tableHeight : this.height;
      return (
        this.tableKey +
        "" +
        this.visibleColumns.length +
        (theHeight || 0) +
        this.key
      );
    },
    visibleColumns: function () {
      return this.fixColumns.filter(
        (item) => item.visible || !item.hasOwnProperty("visible")
      );
    },
  },
  activated() {
    if (this.observe) {
      const innerDom = this.getDom(this.$el, "main");
      this.observe.observe(innerDom, {
        attributes: true,
        childList: false,
        subtree: true,
      });
      this.key = this.key > 100 ? 1 : this.key + 1; // 路由页面缓存时出现表头显示错乱 改变key 刷新表格
    }
  },
  deactivated() {
    this.observe && this.observe.disconnect(); // 非活动标签页，关闭页面监听
  },
  mounted() {
    const innerDom = this.getDom(this.$el, "main");
    const scrollDom = this.$root.$el.childNodes[0];
    if (this.fixWindow && innerDom) {
      let timer,
        times = 1;
      this.observe = new MutationObserver((mu, ob) => {
        // 监听页面改变
        // console.log(scrollDom.scrollHeight , scrollDom.offsetHeight);
        if (
          scrollDom.scrollHeight - scrollDom.offsetHeight > 0 ||
          scrollDom.clientHeight - innerDom.clientHeight - 118 > 0
        ) {
          // console.log("DOM被更新了");
          if (timer) {
            times++;
            return;
          }
          timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            if (times != 1) {
              times = 1;
              const height = this.getHeight();
              if (
                (this.tableHeight <= this.minHeight &&
                  height < this.tableHeight) ||
                height == this.tableHeight
              )
                return;
              this.tableHeight = height;
              // this.key = this.key > 100 ? 1 : this.key + 1
            }
          }, 400);
          if (times != 1) return;
          const height = this.getHeight();
          if (
            (this.tableHeight <= this.minHeight && height < this.tableHeight) ||
            height == this.tableHeight
          )
            return;
          this.tableHeight = height;
          // this.key = this.key > 100 ? 1 : this.key + 1
        }
      });
      this.observe.observe(innerDom, {
        attributes: true,
        childList: false,
        subtree: true,
      });
    }
  },
  methods: {
    renderTpl(h, arr, innerDom) {
      arr.map((item, index) => {
        let childDom = undefined;
        if (item.children) {
          // 如果是多级表头
          childDom = [];
          this.renderTpl(h, item.children, childDom);
        }
        const innerSet = {
          key: (item.prop || "") + index,
          props: {
            resizable: RESIZEABLE,
            "show-overflow-tooltip": SHOWOVERFLOWTOOLTIP,
            align: "center",
            ...item,
          },
        };
        let childSet = undefined;
        if (this.$scopedSlots[item.prop]) {
          // slot 自定义单元格展示
          childSet = [];
          innerSet.scopedSlots = innerSet.scopedSlots || {};
          innerSet.scopedSlots.default = (props) => {
            const obj = { row: props.row, $index: props.$index };
            childSet[0] = this.$scopedSlots[item.prop](obj);
            return childSet;
          };
        }
        if (this.$scopedSlots["header-" + item.prop]) {
          // slot 自定义header
          childSet = [];
          innerSet.scopedSlots = innerSet.scopedSlots || {};
          innerSet.scopedSlots.header = (props) => {
            const obj = { row: { ...item, ...props.column } };
            childSet[0] = this.$scopedSlots["header-" + item.prop](obj);
            return childSet;
          };
        }
        innerDom.push(h("el-table-column", innerSet, childDom));
      });
    },
    getHeight() {
      const scrollDoms = this.$root.$el.childNodes[0];
      const innerDoms = this.getDom(this.$el, "main");
      if (this.fixWindow && scrollDoms && innerDoms) {
        let height;
        if (scrollDoms.scrollHeight - scrollDoms.offsetHeight > 0) {
          // main元素改动 出现滚动条
          height =
            this.$el.offsetHeight -
            this.$el.clientTop -
            (scrollDoms.scrollHeight -
              scrollDoms.offsetHeight +
              scrollDoms.clientTop);
          if (height <= 0) height = this.$el.offsetHeight - this.$el.clientTop;
        } else {
          // main元素改动 未出现滚动条
          height =
            scrollDoms.offsetHeight -
            scrollDoms.clientTop -
            (innerDoms.offsetHeight -
              innerDoms.clientTop -
              this.$el.offsetHeight +
              this.$el.clientTop) -
            118;
        }
        height = Math.max(this.minHeight, height);
        if (Math.abs(this.tableHeight - height) <= 2)
          height = Math.min(this.tableHeight, height); // 纠正1px误差
        return height;
      }
    },
    getDom(el, id) {
      if (!el) {
        return false;
      }
      if (el.id == id) {
        return el;
      }
      return this.getDom(el.parentNode, id);
    },
    handEvent(handle, ...arg) {
      // console.log(handle,arg)
      this.$emit(handle, ...arg);
    },
    clearSelection() {
      this.$refs.table.clearSelection();
    },
    toggleRowSelection(row, selected) {
      this.$refs.table.toggleRowSelection(row, selected);
    },
    toggleAllSelection() {
      this.$refs.table.toggleAllSelection();
    },
    toggleRowExpansion(row, expanded) {
      this.$refs.table.toggleRowExpansion(row, expanded);
    },
    setCurrentRow(row) {
      this.$refs.table.setCurrentRow(row);
    },
    clearSort() {
      this.$refs.table.clearSort();
    },
    clearFilter(columnKey) {
      this.$refs.table.clearFilter(columnKey);
    },
    doLayout() {
      this.$refs.table.doLayout();
    },
    sort(prop, order) {
      this.$refs.table.sort(prop, order);
    },
  },
};
</script>

<style lang="scss" scoped>
.el-table {
  &.summary_ahead {
    // 表头合计 但是偶尔会有像素偏差导致行错位的问题 flex布局引起
    display: flex;
    flex-direction: column;
    //  order默认值为0，只需将表体order置为1即可移到最后，这样合计行就上移到表体上方
    :deep(.el-table__header-wrapper) {
      flex-shrink: 0; // flex布局容器小于内容大小时 内部节点会被压缩尺寸 设置为0表示不压缩
    }
    :deep(.el-table__body-wrapper) {
      order: 1;
      flex-shrink: 0; // flex布局容器小于内容大小时 内部节点会被压缩尺寸 设置为0表示不压缩
    }
  }
  :deep(.el-table__fixed-right) {
    box-shadow: -1px 0 0 1px #dfe6ec;
  }
  &.el-table--border :deep(.el-table__cell:first-child .cell) {
    padding-left: 10px;
    padding-right: 10px;
  }
  ::v-deep .no_border_r {
    border-right: none;
  }
  ::v-deep .fix_column {
    position: sticky;
    background-color: #fff;
  }
  ::v-deep .fix_left {
    left: 0;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
    }
  }
  ::v-deep .fix_right {
    right: 0;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-left: 1px solid #ebeef5;
    }
  }
}
</style>
