import React from 'react';
import { Switch as SwitchAntd, Form } from 'antd';
import type { FieldProps, FormikProps } from 'formik';
import { colors } from '@/themes';

interface CommonSwitchProps {
  label?: string;
  disabled?: boolean;
  afterOnchange?: (checked: boolean, form?: FormikProps<any>) => void;
  required?: boolean;
  isFieldChange?: (name: string) => boolean;
}

const Switch: React.FC<FieldProps & CommonSwitchProps> = ({
  field,
  form,
  label,
  disabled = false,
  afterOnchange,
  isFieldChange,
  required = false,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  const handleChange = (checked: boolean) => {
    form.setFieldValue(field.name, checked);
    form.setFieldTouched(field.name, true, false); // onBlur alternative
    afterOnchange?.(checked, form);
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
      <SwitchAntd checked={field.value} onChange={handleChange} disabled={disabled} />
    </Form.Item>
  );
};

export default Switch;
