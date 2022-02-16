import React, { useEffect, useRef, useState } from "react";
import { Form, message } from "antd";
import { CopyOutlined, FormOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { v4 as uuid } from "uuid";
import { ReactSortable } from "react-sortablejs";
import {
  formConf,
  inputComponents,
  selectComponents,
  layoutComponents,
} from "./form-config";
import { RightPanel } from "./right-panel";
import { FormItemRender } from "../form-item-render";
import { FooterButtons } from "./footer-buttons";
import { CompIcon } from "./comp-icons";

// 每个formItem的占比
const ColSpan = 12;
// formItem内label占比
const labelColSpan = 6;

const isLayoutComp = (item) =>
  item.type === "blank" || item.type === "text" || item.type === "button";

export const FormGenerator = () => {
  const [form] = Form.useForm();

  // 控件配置
  const [formItems, setFormItems] = useState([]);
  // 表单配置
  const [formConfig, setFormConfig] = useState(formConf);
  // 当前选中的控件 选中可以编辑控件属性
  const [compInfo, setCompInfo] = useState(null);

  // 表单控件数 递增
  const formItemIndex = useRef(0);

  // 左侧可选控件列表
  const componentList = [
    {
      title: "输入型组件",
      components: inputComponents,
    },
    {
      title: "选择型组件",
      components: selectComponents,
    },
    {
      title: "布局型组件",
      components: layoutComponents,
    },
  ];

  // 选中并添加控件
  const onItemClick = (item) => {
    formItemIndex.current++;

    // 增加一项，插入一个唯一key
    const newComp = {
      ...item,
      key: uuid(),
      formItemProps: {
        ...item.formItemProps,
        name: `field${formItemIndex.current}`,
        labelCol: { span: labelColSpan },
        wrapperCol: { span: 24 - labelColSpan },
      },
      // 控件通用属性
      span: ColSpan,
      showLabel: isLayoutComp(item) ? undefined : true,
    };

    setFormItems([...formItems, newComp]);

    // 选中
    setCompInfo(newComp);
  };

  // 拖入控件 补齐key
  useEffect(() => {
    const hasInitData = formItems.find((item) => !item.key);

    if (hasInitData) {
      setFormItems(
        formItems.map((item) => {
          if (!item.key) {
            formItemIndex.current++;

            return {
              ...item,
              key: uuid(),
              formItemProps: {
                ...item.formItemProps,
                name: `field${formItemIndex.current}`,
                labelCol: { span: labelColSpan },
                wrapperCol: { span: 24 - labelColSpan },
              },
              // 控件通用属性
              span: ColSpan,
              showLabel: isLayoutComp(item) ? undefined : true,
            };
          }

          return item;
        })
      );
    }
  }, [formItems]);

  // 复制控件 注意要使用新的key
  const onItemCopy = (item) => {
    formItemIndex.current++;

    const copyComp = {
      ...item,
      key: uuid(),
      formItemProps: {
        ...item.formItemProps,
        name: `field${formItemIndex.current}`,
      },
    };
    setFormItems([...formItems, copyComp]);
  };

  // 移除控件
  const onItemDelete = (item) => {
    setFormItems(formItems.filter((el) => el.key !== item.key));

    // 如果删除的是当前高亮，则清空控件信息
    if (compInfo && compInfo.key === item.key) {
      setCompInfo(null);
    }
  };

  // 更新表单属性 type: formItemProps | props | null
  const updateCompProps = (type, newProps) => {
    const getUpdateObj = (item) => {
      if (type === "formItemProps") {
        return {
          formItemProps: {
            ...item.formItemProps,
            ...newProps,
          },
        };
      } else if (type === "props") {
        return {
          props: {
            ...item.props,
            ...newProps,
          },
        };
      } else {
        return newProps;
      }
    };

    // 更新列表
    setFormItems(
      formItems.map((item) => {
        if (item.key === compInfo.key) {
          return {
            ...item,
            ...getUpdateObj(item),
          };
        }

        return item;
      })
    );

    // 更新当前
    setCompInfo({
      ...compInfo,
      ...getUpdateObj(compInfo),
    });

    // 设置初始值 可视化
    if (type === "formItemProps" && newProps.initialValue !== undefined) {
      form.setFieldsValue({
        [compInfo.formItemProps.name]: newProps.initialValue,
      });
    }
  };

  // 保存表单 要区分是新增还是编辑
  const onFormSave = async () => {
    // console.log({
    //   formConfig,
    //   formItems,
    // });

    if (formConfig.name.trim() === "") return message.warning("请输入表单名称");
    if (formItems.length === 0) return message.warning("请完善表单");

    // 判断表单元素字段名是否重复
    const allFormItemsName = formItems.map((item) => item.formItemProps.name);
    const allFormItemsUniq = [...new Set(allFormItemsName)];
    if (allFormItemsName.length > allFormItemsUniq.length)
      return message.warning("组件字段名不能重复，请检查各组件");

    // 忽略掉空的校验规则，否则表单校验时该表单元素必须为空才通过
    const data = {
      formConfig,
      formItems: formItems.map((item) => ({
        ...item,
        formItemProps: {
          ...item.formItemProps,
          ...(item.formItemProps.rules
            ? {
                rules: (item.formItemProps.rules || []).filter(
                  (rule) =>
                    rule.required !== undefined ||
                    (rule.reg && rule.reg.trim() !== "" && rule.message)
                ),
              }
            : {}),
        },
      })),
    };

    const vals = await form.validateFields();
    console.log(data, vals);
  };

  return (
    <Container>
      <div className="form-generator-container">
        <ComponentList>
          {componentList.map((item, index) => (
            <div className="comp-types" key={index}>
              <div>{item.title}</div>
              <div className="components">
                <ReactSortable
                  className="ant-row"
                  group={{
                    name: "comp",
                    pull: "clone",
                    put: false,
                  }}
                  draggable=".component-item"
                  animation={150}
                  sort={false}
                  list={item.components}
                  setList={(e) => {}}
                >
                  {item.components.map((comp, cindex) => (
                    <div
                      key={cindex}
                      className="component-item"
                      onClick={() => onItemClick(comp)}
                    >
                      <CompIcon type={comp.type} />
                      <span>{comp.formItemProps.label}</span>
                    </div>
                  ))}
                </ReactSortable>
              </div>
            </div>
          ))}
        </ComponentList>
        <FormLayout>
          {formItems.length === 0 ? (
            <div className="empty-tips">从左侧拖入或点击组件进行表单设计</div>
          ) : null}
          <Form {...formConfig} form={form}>
            <ReactSortable
              className="ant-row drop-holder"
              group="comp"
              animation={250}
              list={formItems}
              setList={setFormItems}
            >
              {formItems.map((item, index) => (
                <FormItemRender
                  key={index}
                  formConfig={formConfig}
                  item={item}
                  activeKey={compInfo ? compInfo.key : ""}
                  onClick={() => setCompInfo(item)}
                >
                  <div
                    className="icon-btn copy"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemCopy(item);
                    }}
                  >
                    <CopyOutlined />
                  </div>
                  <div
                    className="icon-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemDelete(item);
                    }}
                  >
                    <FormOutlined />
                  </div>
                </FormItemRender>
              ))}
            </ReactSortable>
          </Form>
        </FormLayout>
        <RightPanel
          compInfo={compInfo}
          formConfig={formConfig}
          updateCompProps={updateCompProps}
          setFormConfig={setFormConfig}
        />
      </div>
      <FooterButtons onClose={() => {}} onSave={onFormSave} />
    </Container>
  );
};

const Container = styled.div`
  .form-generator-container {
    display: flex;
    height: calc(100vh - 278px);
    position: relative;
    overflow: hidden;
    padding: 0 10px;
    border: 1px solid #e8e8e8;
  }
`;

const ComponentList = styled.div`
  width: 230px;
  border-right: 1px solid #e8e8e8;
  height: 100%;
  .comp-types {
    padding: 10px 0;
  }
  .components {
    display: flex;
    flex-wrap: wrap;
    .component-item {
      width: 100px;
      border: 1px solid #cecece;
      background-color: #fafafa;
      border-radius: 3px;
      padding: 4px 10px;
      margin: 5px 10px 5px 0;
      cursor: move;
    }
  }
`;

const FormLayout = styled.div`
  height: 80vh;
  flex: 1;
  padding: 10px 10px 0;
  position: relative;
  overflow: auto;
  .drop-holder {
    min-height: 76vh;
    align-content: flex-start;
  }
  .empty-tips {
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    text-align: center;
    font-size: 16px;
    color: #ccc;
  }
  .col-item {
    position: relative;
    padding: 5px;
    .icon-btn {
      position: absolute;
      z-index: 2;
      top: -10px;
      width: 22px;
      height: 22px;
      line-height: 18px;
      text-align: center;
      border-radius: 50%;
      font-size: 12px;
      border: 1px solid #555;
      background: #fff;
      cursor: pointer;
      display: none;
      &.copy {
        right: 50px;
        border-color: #409eff;
        color: #409eff;
      }
      &.delete {
        right: 20px;
        border-color: #f56c6c;
        color: #f56c6c;
      }
    }
    &:hover .icon-btn {
      display: block;
      &.copy {
        background: #409eff;
        color: #fff;
      }
      &.delete {
        background: #f56c6c;
        color: #fff;
      }
    }
    &.active .ant-form-item {
      background: rgba(40, 120, 255, 0.1);
    }
  }
  .ant-form-item {
    padding: 6px;
    border: 1px dashed #e8e8e8;
    border-radius: 2px;
    margin-bottom: 0;
    cursor: move;
    .ant-form-item-control {
      cursor: default;
    }
    &:hover {
      background: rgba(40, 120, 255, 0.1);
    }
  }
  .component-item {
    border: 1px dashed #e8e8e8;
    background: rgba(40, 120, 255, 0.1);
    border-radius: 2px;
    padding: 0 10px;
    margin: 5px;
    display: flex;
    align-items: center;
    flex: 1;
  }
`;
