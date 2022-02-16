import React, { useEffect, useState } from "react";
import { Form, message } from "antd";
import styled from "@emotion/styled";
import cookies from "react-cookies";
import moment from "moment";
import axios from "axios";
import { FormItemRender } from "./form-item-render/index";

/**
 * 用户发起流程表单回显 或 表单数据查看
 * @param type 详情类型
 * @param processesKey 发起时，流程定义key
 * @param initFormData 已发起的，表单数据
 */
export const TaskForm = ({
  type,
  taskType,
  form,
  processesKey,
  initFormData,
}) => {
  // 表单结构数据
  const [formConfig, setFormConfig] = useState({});
  const [formItems, setFormItems] = useState([]);
  // 数据获取完毕 自定义表单可以渲染
  const [ready, setReady] = useState(false);

  // 回显表单结构
  const formDataRender = (formData) => {
    setFormConfig(formData.formConfig);
    // 表单结构数据
    const formItemsAll = formData.formItems.map((item) => ({
      ...item,
      // 因ajax无法保存正则表达式，此处重新实例化正则表达式
      formItemProps: {
        ...item.formItemProps,
        ...(item.formItemProps.rules
          ? {
              rules: (item.formItemProps.rules || [])
                .map((rule) => {
                  if (rule.reg) {
                    try {
                      rule.pattern = new RegExp(rule.reg);
                    } catch (err) {}
                  }
                  return rule;
                })
                // 非必填且空规则 排除
                .filter(
                  (rule) => rule.required !== undefined || rule.reg !== ""
                ),
            }
          : {}),
      },
      props: {
        ...item.props,
        // 草稿箱编辑 表单可以编辑
        ...(taskType === "drafts" && type === "edit"
          ? {}
          : {
              readOnly: true,
              disabled: true,
            }),
        ...(item.type === "upload"
          ? {
              listType: "picture",
            }
          : {}),
      },
    }));
    setFormItems(formItemsAll);
    // 处理下拉和级联异步请求
    updateAsyncData(formItemsAll);

    setReady(true);
  };

  // 从任务详情拿到了表单数据 此时是只读状态
  useEffect(() => {
    // 任务详情
    if (initFormData && initFormData.formData) {
      const formData = initFormData.formData.properties.data;
      formDataRender(formData);
      // 表单值回填
      setFormVals(initFormData.variables, formData);
    }
  }, [initFormData]);

  // 处理异步请求
  const updateAsyncData = (formItems) => {
    const dynamicAll = formItems
      .filter((item) => {
        // 下拉选择 且 是动态数据源
        return (
          (item.type === "select" && item.dataType === "dynamic") ||
          // 级联选择 且 是动态数据
          (item.type === "cascader" && item.dataType === "dynamic")
        );
      })
      .map((item) => {
        const {
          url,
          method,
          data,
          dataKey,
          label = "label",
          value = "value",
          children,
        } = item.fetchProps;
        return new Promise((resolve, reject) => {
          axios({
            method,
            url,
            // 接口请求参数 前端存储的是a=1&b=2
            data,
          }).then((res) => {
            if (
              res.status !== 200 ||
              !res.data ||
              typeof res.data !== "object"
            ) {
              reject();
              return;
            }

            // 接口获取的数据
            const dynamicData = (dataKey ? res.data[dataKey] : res.data) || [];

            // 替换键值
            const loopReplace = (list) =>
              list.map((item) => ({
                ...item,
                label: item[label],
                value: item[value],
                ...(item[children ? children : "children"]
                  ? {
                      children: loopReplace(
                        item[children ? children : "children"]
                      ),
                    }
                  : {}),
              }));

            const fixedData = loopReplace(dynamicData);

            resolve({
              key: item.key,
              response: fixedData,
            });
          });
        });
      });
    // 有动态数据 才请求，【空数组Promise.all照常会跑】
    if (dynamicAll.length == 0) return;
    Promise.all(dynamicAll).then((ress) => {
      let newItems = [...formItems];
      ress.forEach((res) => {
        newItems = newItems.map((item) => {
          if (item.key === res.key) {
            return {
              ...item,
              props: {
                ...item.props,
                options: res.response || [],
              },
            };
          }
          return item;
        });
      });
      setFormItems(newItems);
    });
  };

  /*
        表单值回填
        @params formVals 创建流程时填写的表单数据
        @params formData 表单结构配置
    */
  const setFormVals = (formVals, formData) => {
    if (!formVals) {
      return console.warn("数据有问题，必填项未填写");
    }

    // 查找有没有上传控件，上传值需解析为数组
    formData.formItems.forEach((item) => {
      const formItemName = item.formItemProps.name;
      const formItemValue = formVals[formItemName];

      // upload回显
      if (item.type === "upload") {
        // 上传的文件数据
        if (formItemValue && /^\[/.test(formItemValue)) {
          try {
            let fileList = JSON.parse(formItemValue);
            console.log(fileList);
            fileList = fileList
              .filter((item) => item.status === "done" && item.response)
              .map((fileInfo) => {
                return {
                  ...fileInfo,
                  url: `${
                    fileInfo.response.gdownload_url
                  }?access_token=${cookies.load("accessToken")}`,
                };
              });
            formVals[formItemName] = fileList;
          } catch (err) {
            console.log(err);
          }
        } else {
          // 错误的数据格式
          formVals[formItemName] = [];
        }
      }

      // 日期选择 和 时间选择
      else if (item.type === "datePicker" || item.type === "timePicker") {
        if (formItemValue) {
          formVals[formItemName] = moment(formItemValue);
        }
      }

      // 日期区间 和 时间区间
      else if (
        item.type === "dateRangePicker" ||
        item.type === "timeRangePicker"
      ) {
        if (formItemValue && /^\[/.test(formItemValue)) {
          try {
            const dateRange = JSON.parse(formItemValue);
            formVals[formItemName] = [
              moment(dateRange[0]),
              moment(dateRange[1]),
            ];
          } catch (err) {
            console.log(err);
          }
        }
      }

      // 级联也是数组
      else if (item.type === "cascader") {
        if (formItemValue && /^\[/.test(formItemValue)) {
          try {
            const cascaderData = JSON.parse(formItemValue);
            formVals[formItemName] = cascaderData;
          } catch (err) {
            formVals[formItemName] = [];
            console.log(err);
          }
        } else {
          formVals[formItemName] = [];
        }
      }
    });

    form.setFieldsValue(formVals);
  };

  return ready ? (
    <FormDisplay className="ant-row">
      {formItems.map((item, index) => (
        <FormItemRender key={index} formConfig={formConfig} item={item} />
      ))}
    </FormDisplay>
  ) : null;
};

const FormDisplay = styled(Form)`
  & > .col-item {
    padding: 5px;
    .ant-form-item {
      padding: 6px;
      margin-bottom: 0;
    }
  }
  .ant-select-disabled.ant-select:not(.ant-select-customize-input)
    .ant-select-selector,
  .ant-input[disabled],
  .ant-input-affix-wrapper-disabled,
  .ant-picker.ant-picker-disabled,
  .ant-picker-input > input[disabled] {
    color: inherit;
    background: inherit;
    background-color: inherit;
  }
`;
