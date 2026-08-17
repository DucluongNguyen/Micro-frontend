import React from 'react';
import { Form, InputNumber as AntInputNumber } from 'antd';
import type { FieldProps, FormikProps } from 'formik';
import { getIn } from 'formik';
import { colors } from '@/themes';

interface FormikInputNumberProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  formatter?: (value: number | string | undefined) => string;
  parser?: (value: string | undefined) => number;
  afterOnchange?: (value: any, form?: FormikProps<any>) => void;
  isFieldChange?: (name: string) => boolean;
}

const InputNumber: React.FC<FieldProps & FormikInputNumberProps> = ({
  field,
  form,
  label,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  formatter,
  parser,
  afterOnchange,
  isFieldChange,
  ...rest
}) => {
  const error = getIn(form.errors, field.name);
  const touch = getIn(form.touched, field.name);

  const defaultFormatter = (value?: number | string) => {
    if (value === undefined || value === null || value === '') return '';

    const [integerPart, decimalPart] = value.toString().split('.');

    const formattedInt = (integerPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const formattedDecimal = decimalPart ? decimalPart.replace(/(\d{3})(?=\d)/g, '$1,') : '';

    return formattedDecimal ? `${formattedInt}.${formattedDecimal}` : formattedInt;
  };

  const defaultParser = (value?: string) => {
    if (!value) return '';

    // loại bỏ dấu phẩy trong phần nguyên và thập phân
    const normalized = value.replace(/,/g, '');
    const num = parseFloat(normalized);

    return isNaN(num) ? '' : num;
  };

  const renderLabel = (): React.ReactNode => {
    if (label) {
      return (
        <span
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            display: 'inline-block',
            maxWidth: '100%',
            color: isFieldChange?.(field.name) ? colors.primary : 'inherit',
          }}
        >
          {required && <span style={{ color: 'red' }}>*</span>} {label}
        </span>
      );
    }

    return null;
  };

  return (
    <Form.Item
      labelCol={{ span: 4, style: { textAlign: 'left' } }}
      labelAlign="left"
      {...rest}
      label={renderLabel()}
      validateStatus={error && touch ? 'error' : ''}
      help={error && touch ? String(error) : ''}
    >
      <AntInputNumber
        {...field}
        {...rest}
        id={field.name}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: '100%' }}
        formatter={formatter || defaultFormatter}
        parser={parser || defaultParser}
        onChange={(value) => {
          form.setFieldValue(field.name, value);
          afterOnchange?.(value, form);
        }}
        onBlur={() => form.setFieldTouched(field.name, true)}
      />
    </Form.Item>
  );
};

export default InputNumber;
