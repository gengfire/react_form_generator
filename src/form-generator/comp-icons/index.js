import React from 'react';
// import { Icon } from 'antd';
import styled from '@emotion/styled';

import input from './input.svg';
import textarea from './textarea.svg';
import select from './select.svg';
import cascader from './cascader.svg';
import radio from './radio.svg';
import checkbox from './checkbox.svg';
import switchIcon from './switch.svg';
import rate from './rate.svg';
import timePicker from './time.svg';
import timeRangePicker from './time-range.svg';
import datePicker from './date.svg';
import dateRangePicker from './date-range.svg';
import upload from './upload.svg';
import blank from './blank.svg';
import text from './text.svg';
import button from './button.svg';

const componentIcons = {
    input,
    textarea,
    select,
    cascader,
    radio,
    checkbox,
    switch: switchIcon,
    rate,
    timePicker,
    timeRangePicker,
    datePicker,
    dateRangePicker,
    upload,
    blank,
    text,
    button
};

export const CompIcon = ({ type }) => {
    // return <Icon component={componentIcons[type]} />;
    return <CustomIcon src={componentIcons[type]} />;
};

const CustomIcon = styled.img`
    width: 1em;
    height: 1em;
    vertical-align: -2px;
    margin-right: 2px;
`;
