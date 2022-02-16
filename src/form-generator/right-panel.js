import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Tabs,
  Input,
  Radio,
  Switch,
  Select,
  Tree,
  InputNumber,
  Divider,
  Form,
  message,
  Modal,
} from "antd";
import { v4 as uuid } from "uuid";
import styled from "@emotion/styled";
import {
  PlusCircleOutlined,
  FormOutlined,
  DeleteOutlined,
  SettingOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { SpanSlider } from "./span-slider";
import { acceptList, buttonTypes, buttonHtmlTypes } from "./form-config";

// 属性设置组件
const AttrSetRow = ({
  visible = true,
  label,
  type,
  target,
  propKey,
  compInfo,
  updateCompProps,
  children,
}) => {
  const slot =
    type === "input" ? (
      <Input
        value={compInfo[target][propKey]}
        onChange={(e) =>
          updateCompProps(target, {
            [propKey]: e.target.value,
          })
        }
        maxLength={255}
        allowClear
      />
    ) : (
      children
    );

  return visible ? (
    <div className="attr-item">
      <label>{label}</label>
      <div>{slot}</div>
    </div>
  ) : null;
};

export const RightPanel = ({
  compInfo,
  formConfig,
  updateCompProps,
  setFormConfig,
}) => {
  // 右侧属性面板
  const [attrPanelType, setAttrPanelType] = useState("form-props");

  // 级联树选择
  const [selectedRows, setSelectedRows] = useState([]);
  // 级联新增|编辑
  const [modalVisible, setModalVisible] = useState(0);
  const [form] = Form.useForm();

  // 表单元素变化 属性面板跳至相应类型
  useEffect(() => {
    if (!compInfo) return;

    setAttrPanelType("component-props");
  }, [compInfo]);

  // 下拉选项静态数据变动
  const onOptionChange = (type, index, key, value) => {
    let options = [];
    if (type === "change") {
      options = compInfo.props.options.map((item, eq) => {
        if (eq === index) {
          return {
            ...item,
            [key]: value,
          };
        }
        return item;
      });
    } else if (type === "remove") {
      options = compInfo.props.options.filter((_, eq) => eq !== index);
    } else if (type === "add") {
      const optionsLen = compInfo.props.options.length;

      options = [
        ...compInfo.props.options,
        {
          label: `选项${optionsLen}`,
          value: `选项值${optionsLen}`,
        },
      ];
    }

    updateCompProps("props", {
      options,
    });
  };

  // 动态数据配置
  const updateFetchProps = (key, value) => {
    updateCompProps(null, {
      fetchProps: {
        ...compInfo.fetchProps,
        [key]: value,
      },
    });
  };

  // 增加正则校验
  const onAddRule = () => {
    const { rules } = compInfo.formItemProps;

    updateCompProps("formItemProps", {
      rules: [
        ...rules,
        {
          reg: "",
          message: "",
        },
      ],
    });
  };
  // 设置规则
  const onRuleChange = (index, type, value) => {
    const rulesTemp = JSON.parse(JSON.stringify(compInfo.formItemProps.rules));

    updateCompProps("formItemProps", {
      rules: rulesTemp.map((rule, rindex) => {
        if (rindex === index) {
          rule[type] = value;
          if (type === "reg" && value) {
            try {
              rule.pattern = new RegExp(value);
            } catch (err) {}
          }
        }

        return rule;
      }),
    });
  };
  // 设置必填
  const setFormItemRequired = (value) => {
    // 须深拷贝 不然影响到compInfo.formItemProps.rules了 会对其余控件造成影响
    const rulesTemp = JSON.parse(JSON.stringify(compInfo.formItemProps.rules));

    updateCompProps("formItemProps", {
      required: value,
      rules: rulesTemp.map((rule) => {
        if (rule.required !== undefined) {
          rule.required = value;
        }

        return rule;
      }),
    });
  };

  // Cascader数据组装成treeData
  const getTreeData = (options) => {
    const loop = (list) =>
      list.map((item) => {
        return {
          key: item.ukey,
          title: item.label,
          isLeaf: !item.children,
          info: item,
          ...(item.children ? { children: loop(item.children) } : {}),
        };
      });

    return loop(options);
  };
  // 级联静态数据
  const onTreeAdd = () => {
    setModalVisible(1);
    form.setFieldsValue({
      label: "",
      value: "",
    });
  };
  // 编辑级联
  const onTreeEdit = () => {
    if (selectedRows.length <= 0) return message.error("请选择选项进行编辑");

    setModalVisible(2);

    form.setFieldsValue({
      label: selectedRows[0].info.label,
      value: selectedRows[0].info.value,
    });
  };
  // 删除级联
  const onTreeDelete = () => {
    if (selectedRows.length <= 0) return message.error("请选择需要删除的选项");

    const loop = (list) =>
      list
        .filter((item) => item.ukey !== selectedRows[0].key)
        .map((item) => {
          if (item.children) {
            item.children = loop(item.children);
          }
          return item;
        });
    updateCompProps("props", {
      options: loop(compInfo.props.options),
    });
  };
  // 级联确认
  const onTreeConfirm = async () => {
    const { label, value } = await form.validateFields();

    let options = compInfo.props.options;
    if (selectedRows.length === 0) {
      options = [
        ...options,
        {
          ukey: uuid(),
          label,
          value,
        },
      ];
    } else {
      const loop = (list) =>
        list.map((item) => {
          if (item.ukey === selectedRows[0].key) {
            // 编辑
            if (modalVisible === 2) {
              // 选择也要同步更新
              setSelectedRows(
                selectedRows.map((sitem) => {
                  sitem.title = label;
                  sitem.info.label = label;
                  sitem.info.value = value;
                  return sitem;
                })
              );

              return {
                ...item,
                label,
                value,
              };
            }

            return {
              ...item,
              children: [
                ...(item.children || []),
                {
                  ukey: uuid(),
                  label,
                  value,
                },
              ],
            };
          }
          if (item.children) {
            item.children = loop(item.children);
          }
          return item;
        });
      options = loop(compInfo.props.options);
    }
    updateCompProps("props", {
      options,
    });
    setModalVisible(0);
  };

  // 上传文件类型多选 value: string[]
  const onUploadAcceptChange = (value) => {
    const oldVal = compInfo.props.accept;

    let accept = "";
    if (value.length > 0) {
      const isOldIncludAll = oldVal === "*";
      // 原来就是”所有“
      if (isOldIncludAll) {
        accept = value.filter((item) => item !== "*").join(", ");
      }
      // 原来不是”所有“，勾选“所有”，则全变成所有
      else if (value.indexOf("*") >= 0) {
        accept = "*";
      }
      // 原来不是”所有“，添加其他类型
      else {
        accept = value.join(", ");
      }
    }
    // 未选择 就是”所有“
    else {
      accept = "*";
    }
    updateCompProps("props", { accept });
  };

  const supperProps = {
    compInfo,
    updateCompProps,
  };

  return (
    <Container>
      <Tabs activeKey={attrPanelType} onChange={setAttrPanelType}>
        <Tabs.TabPane tab="组件属性" key="component-props">
          {compInfo ? (
            <div className="attr-list">
              <AttrSetRow
                label="字段名"
                type="input"
                target="formItemProps"
                propKey="name"
                {...supperProps}
              />
              <AttrSetRow label="标题">
                <Input
                  value={compInfo.formItemProps.label}
                  maxLength={255}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.length > 255) {
                      return message.error("做大长度255个字符");
                    } else if (/[\\]|[/:*?”<>|]/.test(value)) {
                      return message.error(
                        "不能含有特殊字符/、\\、:、*、?、”、<、>、|"
                      );
                    }
                    updateCompProps("formItemProps", {
                      label: value,
                    });
                  }}
                  placeholder="请输入表单标题"
                  allowClear
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.placeholder !== undefined}
                label="占位提示"
              >
                <Input
                  value={compInfo.props.placeholder}
                  maxLength={255}
                  onChange={(e) =>
                    updateCompProps("props", {
                      placeholder:
                        compInfo.props.placeholder instanceof Array
                          ? e.target.value.split(",")
                          : e.target.value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.initialValue !== undefined}
                label="默认值"
                type="input"
                target="formItemProps"
                propKey="initialValue"
                {...supperProps}
              />
              <AttrSetRow label="控件栅格">
                <SpanSlider
                  value={compInfo.span}
                  onChange={(value) =>
                    updateCompProps(null, {
                      span: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow label="标签宽度">
                <SpanSlider
                  value={compInfo.formItemProps.labelCol.span}
                  onChange={(value) =>
                    updateCompProps("formItemProps", {
                      labelCol: { span: value },
                      wrapperCol: { span: 24 - value },
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.style !== undefined}
                label="组件宽度"
              >
                <SpanSlider
                  marks={{
                    50: "50%",
                  }}
                  min={10}
                  max={100}
                  size="small"
                  value={
                    compInfo.props.style &&
                    (compInfo.props.style.width === "initial"
                      ? 100
                      : Number.parseInt(compInfo.props.style.width))
                  }
                  onChange={(value) =>
                    updateCompProps("props", {
                      style: { width: `${value}%` },
                    })
                  }
                />
              </AttrSetRow>
              {compInfo.type === "select" ||
              compInfo.type === "cascader" ||
              compInfo.type === "radio" ||
              compInfo.type === "checkbox" ? (
                <div>
                  <Divider>选项</Divider>
                  {compInfo.type === "select" ||
                  compInfo.type === "cascader" ? (
                    <AttrSetRow label="数据来源">
                      <Radio.Group
                        buttonStyle="solid"
                        value={compInfo.dataType}
                        onChange={(e) =>
                          updateCompProps(null, {
                            dataType: e.target.value,
                          })
                        }
                      >
                        <Radio.Button value="static">静态数据</Radio.Button>
                        <Radio.Button value="dynamic">动态数据</Radio.Button>
                      </Radio.Group>
                    </AttrSetRow>
                  ) : null}
                  {compInfo.dataType === "dynamic" ? (
                    <SelectDataSourceSetup>
                      <div className="attr-item">
                        <label>接口地址</label>
                        <div>
                          <Input
                            addonBefore={
                              <Select
                                value={compInfo.fetchProps.method}
                                style={{
                                  width: "84px",
                                }}
                                options={[
                                  {
                                    label: "GET",
                                    value: "GET",
                                  },
                                  {
                                    label: "POST",
                                    value: "POST",
                                  },
                                  {
                                    label: "PUT",
                                    value: "PUT",
                                  },
                                  {
                                    label: "DELETE",
                                    value: "DELETE",
                                  },
                                ]}
                                onChange={(e) => updateFetchProps("method", e)}
                              ></Select>
                            }
                            value={compInfo.fetchProps.url}
                            maxLength={255}
                            onChange={(e) =>
                              updateFetchProps("url", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="attr-item">
                        <label>请求参数</label>
                        <div>
                          <Input
                            value={compInfo.fetchProps.data}
                            onChange={(e) =>
                              updateFetchProps("data", e.target.value)
                            }
                            maxLength={255}
                            placeholder="例：type=1&amp;page=1"
                          />
                        </div>
                      </div>
                      <div className="attr-item">
                        <label>数据位置</label>
                        <div>
                          <Input
                            value={compInfo.fetchProps.dataKey}
                            maxLength={255}
                            onChange={(e) =>
                              updateFetchProps("dataKey", e.target.value)
                            }
                            placeholder="例：list，可指定数据列表键名"
                          />
                        </div>
                      </div>
                      <div className="attr-item">
                        <label>标签名</label>
                        <div>
                          <Input
                            value={compInfo.fetchProps.label}
                            maxLength={255}
                            onChange={(e) =>
                              updateFetchProps("label", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="attr-item">
                        <label>值名</label>
                        <div>
                          <Input
                            value={compInfo.fetchProps.value}
                            maxLength={255}
                            onChange={(e) =>
                              updateFetchProps("value", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      {compInfo.fetchProps.children !== undefined ? (
                        <div className="attr-item">
                          <label>子集键名</label>
                          <div>
                            <Input
                              value={compInfo.fetchProps.children}
                              maxLength={255}
                              onChange={(e) =>
                                updateFetchProps("children", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                    </SelectDataSourceSetup>
                  ) : compInfo.type === "cascader" ? (
                    <div>
                      <Tree
                        treeData={getTreeData(compInfo.props.options)}
                        selectedKeys={selectedRows.map((item) => item.key)}
                        onSelect={(_, { selectedNodes }) =>
                          setSelectedRows(selectedNodes)
                        }
                      />
                      <div className="option-add-btn tree-option-btns">
                        <div onClick={onTreeAdd}>
                          <PlusCircleOutlined />
                          <span>增加</span>
                        </div>
                        <div onClick={onTreeEdit}>
                          <FormOutlined />
                          <span>编辑</span>
                        </div>
                        <div onClick={onTreeDelete}>
                          <DeleteOutlined />
                          <span>删除</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <SelectDataSourceSetup>
                      {compInfo.props.options.map((option, index) => (
                        <Row
                          key={index}
                          className="select-options"
                          gutter={[5, 5]}
                        >
                          <Col span={2}>
                            <SettingOutlined />
                          </Col>
                          <Col span={10}>
                            <Input
                              value={option.label}
                              size="default"
                              maxLength={255}
                              onChange={(e) =>
                                onOptionChange(
                                  "change",
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col span={10}>
                            <Input
                              value={option.value}
                              size="default"
                              maxLength={255}
                              onChange={(e) =>
                                onOptionChange(
                                  "change",
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col span={2}>
                            <MinusCircleOutlined
                              className="option-item-delete"
                              onClick={() => onOptionChange("remove", index)}
                            />
                          </Col>
                        </Row>
                      ))}
                      <div
                        className="option-add-btn"
                        onClick={() => onOptionChange("add")}
                      >
                        <PlusCircleOutlined />
                        <span>增加选项</span>
                      </div>
                    </SelectDataSourceSetup>
                  )}
                  <Divider />
                </div>
              ) : null}
              <AttrSetRow
                visible={compInfo.props.optionType !== undefined}
                label="选项样式"
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={compInfo.props.optionType}
                  onChange={(e) =>
                    updateCompProps("props", {
                      optionType: e.target.value,
                    })
                  }
                  size="small"
                  options={[
                    { label: "默认", value: "default" },
                    { label: "按钮", value: "button" },
                  ]}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.optionType === "button"}
                label="按钮样式"
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={compInfo.props.buttonStyle}
                  onChange={(e) =>
                    updateCompProps("props", {
                      buttonStyle: e.target.value,
                    })
                  }
                  size="small"
                  options={[
                    {
                      label: "线框",
                      value: "outline",
                    },
                    {
                      label: "实体",
                      value: "solid",
                    },
                  ]}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.optionType === "button"}
                label="按钮大小"
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={compInfo.props.size}
                  onChange={(e) =>
                    updateCompProps("props", {
                      size: e.target.value,
                    })
                  }
                  size="small"
                  options={[
                    { label: "大", value: "large" },
                    {
                      label: "中",
                      value: "default",
                    },
                    { label: "小", value: "small" },
                  ]}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "switch"}
                label="选中内容"
                type="input"
                target="props"
                propKey="checkedChildren"
                {...supperProps}
              />
              <AttrSetRow
                visible={compInfo.type === "switch"}
                label="未选中内容"
                type="input"
                target="props"
                propKey="unCheckedChildren"
                {...supperProps}
              />
              <AttrSetRow visible={compInfo.type === "rate"} label="评分总数">
                <InputNumber
                  value={compInfo.props.count}
                  onChange={(value) =>
                    updateCompProps("props", {
                      count: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow visible={compInfo.type === "rate"} label="允许半星">
                <Switch
                  checked={compInfo.props.allowHalf}
                  onChange={(value) =>
                    updateCompProps("props", {
                      allowHalf: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.format !== undefined}
                label="时间格式"
                type="input"
                target="props"
                propKey="format"
                {...supperProps}
              />
              <AttrSetRow
                visible={compInfo.props.showNow !== undefined}
                label="显示此刻"
              >
                <Switch
                  checked={compInfo.props.showNow}
                  onChange={(value) =>
                    updateCompProps("props", {
                      showNow: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "datePicker"}
                label="选择器类型"
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={compInfo.props.picker}
                  onChange={(e) =>
                    updateCompProps("props", {
                      picker: e.target.value,
                    })
                  }
                  size="small"
                  options={[
                    { label: "日期", value: "date" },
                    { label: "周", value: "week" },
                    { label: "月", value: "month" },
                    { label: "季度", value: "quarter" },
                    { label: "年", value: "year" },
                  ]}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.showTime !== undefined}
                label="显示时间"
              >
                <Switch
                  checked={compInfo.props.showTime}
                  onChange={(value) =>
                    updateCompProps("props", {
                      showTime: value,
                      format: value ? "yyyy-MM-DD HH:mm:ss" : "yyyy-MM-DD",
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.fileLimit !== undefined}
                label="文件大小"
              >
                {compInfo.fileLimit !== undefined ? (
                  <InputNumber
                    value={compInfo.fileLimit.size}
                    addonAfter={
                      <Select
                        value={compInfo.fileLimit.symbol}
                        onChange={(value) =>
                          updateCompProps(null, {
                            fileLimit: {
                              ...compInfo.fileLimit,
                              symbol: value,
                            },
                          })
                        }
                        options={[
                          {
                            label: "KB",
                            value: "KB",
                          },
                          {
                            label: "MB",
                            value: "MB",
                          },
                          {
                            label: "GB",
                            value: "GB",
                          },
                        ]}
                        style={{ width: 80 }}
                      />
                    }
                    onChange={(value) =>
                      updateCompProps(null, {
                        fileLimit: {
                          ...compInfo.fileLimit,
                          size: value,
                        },
                      })
                    }
                  />
                ) : null}
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.listType !== undefined}
                label="列表样式"
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={compInfo.props.listType}
                  onChange={(e) =>
                    updateCompProps("props", {
                      listType: e.target.value,
                    })
                  }
                  size="small"
                  options={[
                    { label: "文字", value: "text" },
                    { label: "图片", value: "picture" },
                    {
                      label: "卡片",
                      value: "picture-card",
                    },
                  ]}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "upload"}
                label="文件字段"
                type="input"
                target="props"
                propKey="name"
                {...supperProps}
              />
              <AttrSetRow visible={compInfo.type === "upload"} label="文件类型">
                <Select
                  mode="multiple"
                  value={
                    compInfo.props.accept
                      ? compInfo.props.accept.split(", ")
                      : []
                  }
                  options={acceptList}
                  onChange={onUploadAcceptChange}
                  style={{ width: "100%" }}
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "upload"}
                label="按钮文字"
                type="input"
                target="props"
                propKey="content"
                {...supperProps}
              />
              <AttrSetRow visible={compInfo.type === "upload"} label="显示列表">
                <Switch
                  checked={compInfo.props.showUploadList}
                  onChange={(value) =>
                    updateCompProps("props", {
                      showUploadList: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={
                  compInfo.props.autoSize !== undefined &&
                  compInfo.props.autoSize.minRows
                }
                label="最小行数"
              >
                <InputNumber
                  value={
                    compInfo.props.autoSize && compInfo.props.autoSize.minRows
                  }
                  onChange={(value) =>
                    updateCompProps("props", {
                      autoSize: {
                        ...compInfo.props.autoSize,
                        minRows: value,
                      },
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={
                  compInfo.props.autoSize !== undefined &&
                  compInfo.props.autoSize.minRows
                }
                label="最大行数"
              >
                <InputNumber
                  value={
                    compInfo.props.autoSize && compInfo.props.autoSize.maxRows
                  }
                  onChange={(value) =>
                    updateCompProps("props", {
                      autoSize: {
                        ...compInfo.props.autoSize,
                        maxRows: value,
                      },
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.showCount !== undefined}
                label="显示字数"
              >
                <Switch
                  checked={compInfo.props.showCount}
                  onChange={(value) =>
                    updateCompProps("props", {
                      showCount: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.maxLength !== undefined}
                label="最多输入"
              >
                <InputNumber
                  value={compInfo.props.maxLength}
                  onChange={(value) =>
                    updateCompProps("props", {
                      maxLength: value,
                    })
                  }
                />
              </AttrSetRow>
              {compInfo.type === "button" ? (
                <React.Fragment>
                  <AttrSetRow label="自适应宽">
                    <Switch
                      checked={compInfo.props.style.width === "initial"}
                      onChange={(value) =>
                        updateCompProps("props", {
                          style: {
                            width: "initial",
                          },
                        })
                      }
                    />
                  </AttrSetRow>
                  <AttrSetRow label="按钮类型">
                    <Select
                      value={compInfo.props.type}
                      options={buttonTypes}
                      onChange={(value) =>
                        updateCompProps("props", {
                          type: value,
                        })
                      }
                      style={{ width: "100%" }}
                    />
                  </AttrSetRow>
                  <AttrSetRow label="表单触发">
                    <Select
                      value={compInfo.props.htmlType}
                      options={buttonHtmlTypes}
                      onChange={(value) =>
                        updateCompProps("props", {
                          htmlType: value,
                        })
                      }
                      style={{ width: "100%" }}
                    />
                  </AttrSetRow>
                  <AttrSetRow label="危险按钮">
                    <Switch
                      checked={compInfo.props.danger}
                      onChange={(value) =>
                        updateCompProps("props", {
                          danger: value,
                        })
                      }
                    />
                  </AttrSetRow>
                  <AttrSetRow
                    label="按钮文字"
                    type="input"
                    target="props"
                    propKey="content"
                    {...supperProps}
                  />
                  <AttrSetRow label="按钮大小">
                    <Radio.Group
                      optionType="button"
                      buttonStyle="solid"
                      value={compInfo.props.size}
                      onChange={(e) =>
                        updateCompProps("props", {
                          size: e.target.value,
                        })
                      }
                      options={[
                        { label: "大", value: "large" },
                        { label: "中", value: "middle" },
                        { label: "小", value: "small" },
                      ]}
                    />
                  </AttrSetRow>
                </React.Fragment>
              ) : null}
              <AttrSetRow
                label="显示标签"
                visible={compInfo.type !== "blank" && compInfo.type !== "text"}
              >
                <Switch
                  checked={compInfo.showLabel}
                  onChange={(value) =>
                    updateCompProps(null, {
                      showLabel: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.allowClear !== undefined}
                label="能够清空"
              >
                <Switch
                  checked={compInfo.props.allowClear}
                  onChange={(value) =>
                    updateCompProps("props", {
                      allowClear: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.showSearch !== undefined}
                label="能否搜索"
              >
                <Switch
                  checked={compInfo.props.showSearch}
                  onChange={(value) =>
                    updateCompProps("props", {
                      showSearch: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.mode !== undefined}
                label="是否多选"
              >
                <Switch
                  checked={compInfo.props.mode}
                  onChange={(value) =>
                    updateCompProps("props", {
                      mode: value ? "multiple" : "",
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.multiple !== undefined}
                label="支持多选"
              >
                <Switch
                  checked={compInfo.props.multiple}
                  onChange={(value) =>
                    updateCompProps("props", {
                      multiple: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.readOnly !== undefined}
                label="是否只读"
              >
                <Switch
                  checked={compInfo.props.readOnly}
                  onChange={(value) =>
                    updateCompProps("props", {
                      readOnly: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.props.disabled !== undefined}
                label="是否禁用"
              >
                <Switch
                  checked={compInfo.props.disabled}
                  onChange={(value) =>
                    updateCompProps("props", {
                      disabled: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                label="是否必填"
                visible={
                  compInfo.type !== "blank" &&
                  compInfo.type !== "text" &&
                  compInfo.type !== "button"
                }
              >
                <Switch
                  checked={compInfo.formItemProps.required}
                  onChange={setFormItemRequired}
                />
              </AttrSetRow>
              <AttrSetRow visible={compInfo.type === "blank"} label="高度">
                <InputNumber
                  value={compInfo.props.height}
                  addonAfter="px"
                  onChange={(value) =>
                    updateCompProps("props", {
                      height: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "text"}
                label="文字内容"
                type="input"
                target="props"
                propKey="content"
                {...supperProps}
              />
              <AttrSetRow visible={compInfo.type === "text"} label="文字大小">
                <InputNumber
                  value={compInfo.props.fontSize}
                  addonAfter="px"
                  onChange={(value) =>
                    updateCompProps("props", {
                      fontSize: value,
                    })
                  }
                />
              </AttrSetRow>
              <AttrSetRow
                visible={compInfo.type === "text"}
                label="文字颜色"
                type="input"
                target="props"
                propKey="color"
                {...supperProps}
              />
              {compInfo.formItemProps.rules !== undefined ? (
                <React.Fragment>
                  <Divider>校验规则</Divider>
                  <RulesList>
                    {compInfo.formItemProps.rules.map((rule, index) =>
                      rule.required === undefined ? (
                        <div key={index} className="rule-item">
                          <div className="attr-item">
                            <label>表达式</label>
                            <div>
                              <Input
                                value={rule.reg}
                                maxLength={255}
                                onChange={(e) =>
                                  onRuleChange(index, "reg", e.target.value)
                                }
                                placeholder="正则表达式，例：^[0-9]+$"
                              />
                            </div>
                          </div>
                          <div className="attr-item">
                            <label>错误提示</label>
                            <div>
                              <Input
                                value={rule.message}
                                maxLength={255}
                                onChange={(e) =>
                                  onRuleChange(index, "message", e.target.value)
                                }
                                placeholder="请输入错误提示语"
                              />
                            </div>
                          </div>
                          <div className="rule-remove-btn">
                            <MinusCircleOutlined
                              onClick={() =>
                                updateCompProps("formItemProps", {
                                  rules: compInfo.formItemProps.rules.filter(
                                    (_, rindex) => rindex !== index
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : null
                    )}
                    <div className="option-add-btn" onClick={onAddRule}>
                      <PlusCircleOutlined />
                      <span>增加规则</span>
                    </div>
                  </RulesList>
                </React.Fragment>
              ) : null}
            </div>
          ) : (
            <div className="empty-data">请从左侧选择组件</div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="表单属性" key="form-props">
          <AttrSetRow label="表单名称">
            <Input
              value={formConfig.name}
              maxLength={255}
              onChange={(e) => {
                const value = e.target.value;

                if (value.length > 255) {
                  return message.error("做大长度255个字符");
                } else if (/[\\]|[/:*?”<>|]/.test(value)) {
                  return message.error(
                    "不能含有特殊字符/、\\、:、*、?、”、<、>、|"
                  );
                }

                setFormConfig({
                  ...formConfig,
                  name: value,
                });
              }}
              placeholder="请输入表单名称"
              allowClear
            />
          </AttrSetRow>
          <AttrSetRow label="表单布局">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={formConfig.layout}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  layout: e.target.value,
                })
              }
              options={[
                { label: "水平", value: "horizontal" },
                { label: "垂直", value: "vertical" },
                { label: "行内", value: "inline" },
              ]}
            />
          </AttrSetRow>
          <AttrSetRow label="标签对齐">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={formConfig.labelAlign}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  labelAlign: e.target.value,
                })
              }
              options={[
                { label: "左", value: "left" },
                { label: "右", value: "right" },
              ]}
            />
          </AttrSetRow>
          <AttrSetRow label="控件大小">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={formConfig.size}
              onChange={(e) =>
                setFormConfig({
                  ...formConfig,
                  size: e.target.value,
                })
              }
              options={[
                { label: "大", value: "large" },
                { label: "中", value: "default" },
                { label: "小", value: "small" },
              ]}
            />
          </AttrSetRow>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        visible={modalVisible !== 0}
        title={modalVisible === 1 ? "增加选项" : "编辑选项"}
        onCancel={() => setModalVisible(0)}
        onConfirm={onTreeConfirm}
      >
        <Form form={form}>
          <Form.Item
            name="label"
            rules={[{ required: true, message: "请输入选项名称" }]}
          >
            <Input placeholder="请输入选项名称" maxLength={255} />
          </Form.Item>
          <Form.Item
            name="value"
            rules={[{ required: true, message: "请输入选项值" }]}
          >
            <Input placeholder="请输入选项值" maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  height: 80vh;
  border-left: 1px solid #e8e8e8;
  width: 320px;
  padding-left: 10px;
  .attr-list {
    height: calc(100vh - 340px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .ant-input-affix-wrapper .ant-input {
    height: 22px;
  }
  .attr-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #606266;
    & > label {
      padding-right: 10px;
      width: 80px;
      text-align: right;
    }
    & > div {
      flex: 1;
    }
  }
  .option-add-btn {
    padding-left: 24px;
    color: #2878ff;
    cursor: pointer;
    & > span {
      margin-left: 4px;
    }
  }
  .tree-option-btns {
    & > div {
      display: inline-block;
      margin-right: 20px;
      & > span {
        margin-left: 4px;
      }
    }
  }
  .empty-data {
    color: #999;
    padding: 20px 10px;
  }
`;

const SelectDataSourceSetup = styled.div`
  padding-left: 15px;
  .select-options {
    align-items: center;
    padding-bottom: 10px;
    .option-item-icon {
      font-size: 18px;
      color: #aaa;
    }
    .option-item-delete {
      color: #f56c6c;
      cursor: pointer;
      font-size: 20px;
    }
  }
  .attr-item > label {
    width: 64px;
    padding-right: 6px;
  }
`;

const RulesList = styled.div`
  .rule-item {
    border: 1px solid #eee;
    padding: 10px 30px 10px 0;
    border-radius: 4px;
    margin-bottom: 10px;
    position: relative;
    & > .attr-item {
      margin-bottom: 10px;
      &:last-of-type {
        margin-bottom: 0;
      }
    }
    .rule-remove-btn {
      position: absolute;
      color: #f56c6c;
      cursor: pointer;
      font-size: 20px;
      right: 4px;
      top: 32px;
    }
  }
`;
