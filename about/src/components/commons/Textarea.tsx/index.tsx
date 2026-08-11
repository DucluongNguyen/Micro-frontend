import React from 'react';
import { Input, Form } from 'antd';
import type { FieldProps } from 'formik';

const { TextArea } = Input;

interface CommonTextareaProps {
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const Textarea: React.FC<FieldProps & CommonTextareaProps> = ({
  field,
  form,
  label,
  placeholder = '',
  rows = 4,
  disabled = false,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  return (
    <Form.Item
      label={label}
      validateStatus={error ? 'error' : ''}
      help={error ? String(error) : ''}
      {...rest}
    >
      <TextArea
        {...field}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        onBlur={() => form.setFieldTouched(field.name, true)}
      />
    </Form.Item>
  );
};

export default Textarea;
