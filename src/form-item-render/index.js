import React, { useState, useCallback } from "react";
import {
  Form,
  Col,
  Input,
  Radio,
  Checkbox,
  Switch,
  TimePicker,
  DatePicker,
  Upload,
  Button,
  Select,
  Rate,
  Cascader,
  message,
} from "antd";
import locale from "antd/es/date-picker/locale/zh_CN";
import { UploadOutlined } from "@ant-design/icons";

const { Item: FormItem } = Form;

// 文件大小转换表
const sizeTable = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1204,
};
// 多媒体校验
const media = ["image/*", "audio/*", "video/*"];

// 自定义表单渲染
export const FormItemRender = ({
  formConfig,
  item,
  activeKey,
  children,
  onClick,
}) => {
  // 自定义上传请求
  const customRequest = ({ onSuccess, onError, file }) => {
    const formData = new FormData();
    formData.append("file", file);

    // upload(formData).then((res) => {
    //   if (res.code !== "SUCCESS") {
    //     message.error(res.message);
    //     return onError();
    //   }
    //   onSuccess(res.data);
    // });

    onSuccess(file);
  };

  // 文件上传前校验格式 大小
  const beforeUpload = (file) => {
    console.log(file, item);

    // 文件格式限制
    const accept = item.props.accept;
    if (accept !== "*") {
      const acceptArr = accept.split(", ");

      // 未包含* 校验各类型
      if (acceptArr.indexOf("*") < 0) {
        // 上传的是多媒体类型
        const isMediaFile =
          media.filter(
            (mediaItem) =>
              (file.type || "").indexOf(mediaItem.replace("*", "")) >= 0
          ).length > 0;
        if (isMediaFile) {
          // 不支持的多媒体  'image/*, .doc,.docx' 'image/png'
          const notMatchMedia =
            accept.indexOf(`${file.type.split("/")[0]}/`) < 0;
          if (notMatchMedia) {
            message.error("文件格式不支持");
            return Upload.LIST_IGNORE;
          }
        } else {
          // 后缀不匹配 'image/*, .doc,.docx' 'dadsad.doc'
          const fileSuffix = file.name.split(".").pop();
          const notMatchSuffix = accept.indexOf(`.${fileSuffix}`) < 0;
          if (notMatchSuffix) {
            message.error("文件格式不支持");
            return Upload.LIST_IGNORE;
          }
        }
      }
    }

    // 文件大小限制
    const fileLimit = item.fileLimit || {
      size: 2,
      symbol: "MB",
    };
    const fileSizeLimit = fileLimit.size * sizeTable[fileLimit.symbol];
    if (file.size > fileSizeLimit) {
      message.error(
        `文件大小超过限制，最大支持${fileLimit.size}${fileLimit.symbol}`
      );
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const inputEl = useCallback(
    ({ type, props }) => {
      switch (type) {
        case "input":
          return <Input {...props} />;

        case "textarea":
          return <Input.TextArea {...props} />;

        case "select":
          return <Select {...props} />;

        case "cascader":
          return <Cascader {...props} />;

        case "radio":
          return <Radio.Group {...props}></Radio.Group>;

        case "checkbox":
          return <Checkbox.Group {...props} />;

        case "switch":
          return <Switch {...props} />;

        case "rate":
          return <Rate {...props} />;

        case "timePicker":
          return <TimePicker {...props} locale={locale} />;

        case "timeRangePicker":
          return <TimePicker.RangePicker {...props} locale={locale} />;

        case "datePicker":
          return <DatePicker {...props} locale={locale} />;

        case "dateRangePicker":
          return <DatePicker.RangePicker {...props} locale={locale} />;

        case "upload":
          return (
            <Upload
              {...props}
              beforeUpload={beforeUpload}
              customRequest={customRequest}
            >
              {props.listType !== "picture-card" ? (
                <Button icon={<UploadOutlined />}>{props.content}</Button>
              ) : (
                props.content
              )}
            </Upload>
          );

        case "blank":
          return <div style={{ ...props }}></div>;

        case "text":
          return <span style={{ ...props }}>{props.content}</span>;

        case "button":
          return <Button {...props}>{props.content}</Button>;

        default:
          return "";
      }
    },
    [item]
  );

  // 上传事件转换为表单字段 处理多文件以及上传错误
  const onUploadChange = (e) => {
    // 多文件？？
    if (e instanceof Array) {
      console.log(111, e);
      return e.filter((item) => item.status !== "error");
    }
    // 单文件
    return e && e.fileList.filter((item) => item.status !== "error");
  };

  return (
    <Col
      span={item.span || formConfig.span}
      className={`col-item ${item.key === activeKey ? "active" : ""}`}
      onClick={() => {
        onClick && onClick();
      }}
    >
      <FormItem
        {...item.formItemProps}
        {...(formConfig.labelAlign
          ? { labelAlign: formConfig.labelAlign }
          : {})}
        {...(!item.showLabel ? { label: "" } : {})}
        {...(!item.showLabel || formConfig.layout !== "horizontal"
          ? {
              labelCol: undefined,
              wrapperCol: undefined,
            }
          : {})}
        {...(item.type === "upload"
          ? {
              getValueFromEvent: onUploadChange,
            }
          : {})}
      >
        {inputEl(item)}
      </FormItem>
      {children}
    </Col>
  );
};
