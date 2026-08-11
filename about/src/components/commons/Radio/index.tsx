import React from 'react';
import { Form, Radio as RadioAntd } from 'antd';
import { FieldProps } from 'formik';
import { colors } from '@/themes';

export interface RadioOption {
  label: string;
  value: string | number;
}

interface CommonRadioProps {
  label?: string;
  options: RadioOption[];
  disabled?: boolean;
  optionType?: 'default' | 'button';
  afterOnchange?: (value: any) => void;
  required?: boolean;
  isFieldChange?: (name: string) => boolean;
}

const Radio: React.FC<FieldProps & CommonRadioProps> = ({
  field,
  form,
  label,
  options,
  disabled = false,
  optionType = 'default',
  afterOnchange,
  isFieldChange,
  required = false,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  const handleChange = (e: any) => {
    const selectedOption = e.target.value;
    form.setFieldValue(field.name, selectedOption);
    afterOnchange && afterOnchange(selectedOption);
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
      <RadioAntd.Group
        name={field.name}
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
        value={field.value}
        disabled={disabled}
      >
        {options.map((opt) =>
          optionType === 'button' ? (
            <RadioAntd.Button key={opt.value} value={opt.value}>
              {opt.label}
            </RadioAntd.Button>
          ) : (
            <RadioAntd key={opt.value} value={opt.value}>
              {opt.label}
            </RadioAntd>
          ),
        )}
      </RadioAntd.Group>
    </Form.Item>
  );
};

export default Radio;
