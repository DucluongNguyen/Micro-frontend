import { colors } from '@/themes';
import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined } from '@ant-design/icons';
import { Form, Input as InputAntd } from 'antd';
import type { FieldProps, FormikProps } from 'formik';
import { getIn } from 'formik';
import React from 'react';

interface FormikInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  toggleIcon?: boolean;
  loading?: boolean;
  afterOnchange?: (value: string, form?: FormikProps<any>) => void;
  isFieldChange?: (name: string) => boolean;
}

const Input: React.FC<FieldProps & FormikInputProps> = ({
  field,
  form,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  toggleIcon = false,
  loading = false,
  afterOnchange,
  isFieldChange,
  ...rest
}) => {
  const error = getIn(form.errors, field.name);
  const touch = getIn(form.touched, field.name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e);
    afterOnchange?.(e.target.value, form);
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <span style={{ color: isFieldChange?.(field.name) ? colors.primary : 'inherit' }}>
        {required && <span style={{ color: 'red' }}>*</span>} {label}
      </span>
    );
  };

  const suffix = loading ? <LoadingOutlined spin style={{ color: '#999' }} /> : undefined;

  return (
    <Form.Item
      labelCol={{ span: 2, style: { textAlign: 'left' } }}
      labelAlign="left"
      {...rest}
      label={renderLabel()}
      validateStatus={touch && error ? 'error' : ''}
      help={error && touch ? String(error) : ''}
    >
      {type === 'password' && toggleIcon ? (
        <InputAntd.Password
          {...field}
          {...rest}
          name={field.name}
          placeholder={placeholder}
          disabled={disabled || loading} // ✅ disable khi loading
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          suffix={suffix} // ✅ thêm loading icon
          onChange={handleChange}
        />
      ) : (
        <InputAntd
          {...field}
          {...rest}
          name={field.name}
          type={type}
          placeholder={placeholder}
          disabled={disabled || loading} // ✅ disable khi loading
          suffix={suffix} // ✅ thêm loading icon
          onChange={handleChange}
        />
      )}
    </Form.Item>
  );
};

export default Input;
