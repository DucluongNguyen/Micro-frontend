import React from 'react';
import { Input, Form } from 'antd';
import type { FieldProps, FormikProps } from 'formik';

const { TextArea } = Input;

interface CommonTextareaProps {
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  afterOnchange?: (value: string, form?: FormikProps<any>) => void;
}

const Textarea: React.FC<FieldProps & CommonTextareaProps> = ({
  field,
  form,
  label,
  placeholder = '',
  rows = 4,
  disabled = false,
  afterOnchange,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    field.onChange(e);
    afterOnchange?.(e.target.value, form);
  };

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
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
      />
    </Form.Item>
  );
};

export default Textarea;
