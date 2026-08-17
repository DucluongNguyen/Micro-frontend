import { Slider as SliderAntd, Form } from 'antd';
import type { FieldProps, FormikProps } from 'formik';
import React from 'react';
interface CommonSliderProps {
  label?: string;
  tooltip?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  marks?: any;
  afterOnchange?: (value: any, form?: FormikProps<any>) => void;
}
const Slider: React.FC<FieldProps & CommonSliderProps> = ({
  field,
  form,
  label,
  tooltip,
  disabled,
  min,
  max,
  step,
  range = false,
  marks,
  afterOnchange,
  ...rest
}) => {
  const error = form.errors[field.name];
  const touched = form.touched[field.name];
  const handleChange = (value: any) => {
    form.setFieldValue(field.name, value);
    afterOnchange?.(value, form);
  };
  return (
    <Form.Item
      labelCol={{ span: 2, style: { textAlign: 'left' } }}
      labelAlign="left"
      // wrapperCol={{ span: 20 }}
      validateStatus={touched && error ? 'error' : ''}
      help={touched && error ? (error as string) : ''}
      {...rest}
      label={label}
    >
      <SliderAntd
        {...rest}
        value={field.value ?? (range ? [min || 0, max || 100] : min || 0)}
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
        min={min}
        max={max}
        step={step}
        range={range}
        marks={marks}
        disabled={disabled}
      />
    </Form.Item>
  );
};
export default Slider;
