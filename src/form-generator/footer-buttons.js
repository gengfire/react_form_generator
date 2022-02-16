import React from "react";
import { Button } from "antd";
import styled from "@emotion/styled";

export const FooterButtons = ({ onClose, onSave }) => {
  return (
    <Buttons>
      <Button type="default" size="large" shape="round" onClick={onClose}>
        取消
      </Button>
      <Button type="primary" size="large" shape="round" onClick={onSave}>
        提交
      </Button>
    </Buttons>
  );
};

const Buttons = styled.div`
  padding: 20px;
  text-align: center;
  & > button {
    width: 120px;
    margin: 0 6px;
  }
`;
