// 表单属性【右面板】
export const formConf = {
  name: "",

  // Form属性
  layout: "horizontal",
  labelAlign: "left",
  size: "default",
};

// 输入型组件 【左面板】
export const inputComponents = [
  {
    type: "input",
    // 表单属性
    formItemProps: {
      label: "单行文本",
      name: "field",
      initialValue: undefined,
      required: true,
      rules: [{ required: true, message: "请输入" }],
    },
    // 控件属性
    props: {
      placeholder: "请输入",
      style: { width: "100%" },
      maxLength: null,
      allowClear: true,
      readOnly: false,
      disabled: false,
    },
  },
  {
    type: "textarea",
    formItemProps: {
      label: "多行文本",
      initialValue: undefined,
      required: true,
      rules: [{ required: true, message: "请输入" }],
    },
    props: {
      placeholder: "请输入",
      style: { width: "100%" },
      maxLength: null,
      allowClear: true,
      readOnly: false,
      disabled: false,
      autoSize: {
        minRows: 4,
        maxRows: 6,
      },
      showCount: false,
    },
  },
];

// 选择型组件 【左面板】
export const selectComponents = [
  {
    type: "select",
    formItemProps: {
      label: "下拉选择",
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      options: [
        {
          label: "选项一",
          value: "1",
        },
        {
          label: "选项二",
          value: "2",
        },
        {
          label: "选项三",
          value: "3",
        },
      ],
      placeholder: "请选择",
      style: { width: "100%" },
      allowClear: true,
      disabled: false,
      showSearch: false,
      mode: "",
    },
    dataType: "static",
    // 动态数据时 参数配置
    fetchProps: {
      method: "GET",
      url: "https://baidu.com/api/getList",
      data: "",
      dataKey: "",
      label: "label",
      value: "value",
    },
  },
  {
    type: "cascader",
    formItemProps: {
      label: "级联选择",
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      placeholder: "请选择",
      style: { width: "100%" },
      options: [
        {
          ukey: "1",
          value: "1",
          label: "选项1",
          children: [
            {
              ukey: "11",
              value: "11",
              label: "选项1-1",
            },
          ],
        },
      ],
      multiple: false,
      disabled: false,
      allowClear: true,
      showSearch: false,
    },
    // 静态数据 or 动态数据
    dataType: "static",
    // 动态数据时 参数配置
    fetchProps: {
      method: "GET",
      url: "https://baidu.com/api/getList",
      data: "",
      dataKey: "",
      label: "label",
      value: "value",
      children: "children",
    },
  },
  {
    type: "radio",
    formItemProps: {
      label: "单选框组",
      initialValue: undefined,
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      placeholder: "请选择",
      options: [
        {
          label: "选项一",
          value: 1,
        },
        {
          label: "选项二",
          value: 2,
        },
      ],
      style: { width: "100%" },
      disabled: false,
      optionType: "default",
      buttonStyle: "solid",
      size: "default",
    },
  },
  {
    type: "checkbox",
    formItemProps: {
      label: "多选框组",
      initialValue: [],
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      options: [
        {
          label: "选项一",
          value: 1,
        },
        {
          label: "选项二",
          value: 2,
        },
      ],
      disabled: false,
    },
  },
  {
    type: "switch",
    formItemProps: {
      label: "开关",
      valuePropName: "checked",
      initialValue: false,
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      checkedChildren: "开",
      unCheckedChildren: "关",
      disabled: false,
    },
  },
  {
    type: "rate",
    formItemProps: {
      label: "评分",
      initialValue: 0,
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      count: 5,
      allowHalf: false,
      disabled: false,
    },
  },
  {
    type: "timePicker",
    formItemProps: {
      label: "时间选择",
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      placeholder: "请选择",
      style: { width: "100%" },
      disabled: false,
      allowClear: true,
      format: "HH:mm:ss",
      showNow: true,
    },
  },
  {
    type: "timeRangePicker",
    formItemProps: {
      label: "时间范围",
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      placeholder: ["开始时间", "结束时间"],
      style: { width: "100%" },
      disabled: false,
      allowClear: true,
      format: "HH:mm:ss",
    },
  },
  {
    type: "datePicker",
    formItemProps: {
      label: "日期选择",
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      placeholder: "请选择",
      style: { width: "100%" },
      disabled: false,
      allowClear: true,
      format: "yyyy-MM-DD",
      picker: "date",
      showTime: false,
    },
  },
  {
    type: "dateRangePicker",
    formItemProps: {
      label: "日期范围",
      initialValue: null,
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      style: { width: "100%" },
      placeholder: ["开始日期", "结束日期"],
      disabled: false,
      readOnly: false,
      allowClear: true,
      format: "yyyy-MM-DD",
      picker: "date",
      showTime: false,
    },
  },
  {
    type: "upload",
    formItemProps: {
      label: "上传",
      valuePropName: "fileList",
      initialValue: [],
      required: true,
      rules: [{ required: true, message: "请选择" }],
    },
    props: {
      disabled: false,
      name: "file",
      accept: "*",
      multiple: false,
      showUploadList: true,
      listType: "text",
      content: "选择文件",
    },
    fileLimit: {
      size: 2,
      symbol: "MB",
    },
  },
];

// 布局型组件 【左面板】
export const layoutComponents = [
  {
    type: "button",
    formItemProps: {
      label: "按钮",
    },
    props: {
      content: "按钮",
      type: "primary",
      htmlType: "button",
      danger: false,
      shape: "default",
      size: "middle",
      disabled: false,
      style: {
        width: "initial",
      },
    },
  },
  {
    type: "text",
    formItemProps: {
      label: "文字",
    },
    props: {
      fontSize: 14,
      color: "#555555",
      content: "文字",
    },
  },
  {
    type: "blank",
    formItemProps: {
      label: "空白间隔",
    },
    props: {
      height: 10,
    },
  },
  // {
  //     type: 'row',
  //     formItemProps: {
  //         label: '行容器'
  //     },
  //     props: {
  //         justify: 'start',
  //         align: 'top'
  //     }
  // },
];

export const acceptList = [
  {
    label: "所有",
    value: "*",
  },
  {
    label: "图片",
    value: "image/*",
  },
  {
    label: "视频",
    value: "video/*",
  },
  {
    label: "音频",
    value: "audio/*",
  },
  {
    label: "excel",
    value: ".xls,.xlsx",
  },
  {
    label: "word",
    value: ".doc,.docx",
  },
  {
    label: "pdf",
    value: ".pdf",
  },
  {
    label: "txt",
    value: ".txt",
  },
];

// 按钮颜色类型
export const buttonTypes = [
  {
    label: "primary",
    value: "primary",
  },
  {
    label: "ghost",
    value: "ghost",
  },
  {
    label: "dashed",
    value: "dashed",
  },
  {
    label: "link",
    value: "link",
  },
  {
    label: "text",
    value: "text",
  },
  {
    label: "default",
    value: "default",
  },
];

// 按钮htmlType
export const buttonHtmlTypes = [
  {
    label: "普通按钮",
    value: "button",
  },
  // {
  //     label: '表单提交',
  //     value: 'submit'
  // },
  {
    label: "表单重置",
    value: "reset",
  },
];
