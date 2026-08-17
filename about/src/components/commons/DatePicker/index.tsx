import React from 'react';
import { DatePicker as DatePickerAntd, Form } from 'antd';
import type { FieldProps, FormikProps } from 'formik';
import { getIn } from 'formik';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { colors } from '@/themes';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

interface CommonDatePickerProps {
  label?: string;
  disabled?: boolean;
  format?: string;
  placeholder?: string;
  required?: boolean;
  afterOnchange?: (value: dayjs.Dayjs | undefined, form?: FormikProps<any>) => void;
  isFieldChange?: (name: string) => boolean;
}

const DatePicker: React.FC<FieldProps & CommonDatePickerProps> = ({
  field,
  form,
  label,
  disabled = false,
  format = 'YYYY-MM-DD',
  placeholder,
  afterOnchange,
  isFieldChange,
  required = false,
  ...rest
}) => {
  const error = getIn(form.errors, field.name);
  const touch = getIn(form.touched, field.name);

  const handleChange = (date: dayjs.Dayjs | null) => {
    const value = date ? dayjs(date) : undefined;
    form.setFieldValue(field.name, value);
    afterOnchange?.(value, form);
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
      //wrapperCol={{ span: 20 }}
      {...rest}
      label={renderLabel()}
      validateStatus={error && touch ? 'error' : ''}
      help={error && touch ? String(error) : ''}
    >
      <DatePickerAntd
        {...rest}
        value={field.value}
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
        format={format}
        disabled={disabled}
        placeholder={placeholder}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
};

export default DatePicker;
