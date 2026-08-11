import React from 'react';
import { DatePicker, Form } from 'antd';
import { FieldProps } from 'formik';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { colors } from '@/themes';

const { RangePicker } = DatePicker;

interface CommonDateRangePickerProps {
  label?: string;
  disabled?: boolean;
  format?: string;
  placeholder?: [string, string];
  afterOnchange?: (value: string[] | null[]) => void;
  required?: boolean;
  isFieldChange?: (name: string) => boolean;
}

const DateRangePicker: React.FC<FieldProps & CommonDateRangePickerProps> = ({
  field,
  form,
  label,
  disabled = false,
  format = 'DD/MM/YYYY',
  placeholder = ['Từ ngày', 'Đến ngày'],
  afterOnchange,
  isFieldChange,
  required = false,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  const value = field.value
    ? [
        field.value?.[0] ? dayjs(field.value[0]) : undefined,
        field.value?.[1] ? dayjs(field.value[1]) : undefined,
      ]
    : [null, null];

  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      form.setFieldValue(field.name, [null, null]);
      afterOnchange?.([null, null]);
    } else {
      form.setFieldValue(field.name, [dates[0].toISOString(), dates[1].toISOString()]);
      afterOnchange?.([dates[0].toISOString(), dates[1].toISOString()]);
    }
    form.setFieldTouched(field.name, true, false);
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <span style={{ color: isFieldChange?.(field.name) ? colors.primary : 'inherit' }}>
        {required && <span style={{ color: 'red' }}>*</span>} {label}
      </span>
    );
  };

  return (
    <Form.Item
      labelCol={{ span: 2, style: { textAlign: 'left' } }}
      labelAlign="left"
      // wrapperCol={{ span: 20 }}
      {...rest}
      label={renderLabel()}
      validateStatus={error ? 'error' : ''}
      help={error ? String(error) : ''}
    >
      <RangePicker
        {...rest}
        value={value as [Dayjs | null, Dayjs | null]}
        onChange={handleChange}
        format={format}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
};

export default DateRangePicker;
