import React from 'react';
import { Slider } from 'antd';

export const SpanSlider = (props) => (
    <Slider
        marks={{
            6: '6',
            12: '12',
            18: '18'
        }}
        min={1}
        max={24}
        size="small"
        {...props}
    />
);
