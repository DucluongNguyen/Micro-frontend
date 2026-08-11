import { colors } from '@/themes';
import { Checkbox as CheckboxAntd, Form } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { FieldProps } from 'formik';

interface CommonCheckboxProps {
  label: string;
  disabled?: boolean;
  required?: boolean;
  isFieldChange?: boolean;
}

const Checkbox: React.FC<FieldProps & CommonCheckboxProps> = ({
  field,
  form,
  label,
  disabled = false,
  isFieldChange = false,
  required = false,
  ...rest
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  const handleChange = (e: CheckboxChangeEvent) => {
    form.setFieldValue(field.name, e.target.checked);
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <span style={{ color: isFieldChange ? colors.primary : 'inherit' }}>
        {required && <span style={{ color: 'red' }}>*</span>} {label}
      </span>
    );
  };

  return (
    <Form.Item
      labelCol={{ span: 2, style: { textAlign: 'left' } }}
      // wrapperCol={{ span: 20 }}
      labelAlign="left"
      {...rest}
      validateStatus={error ? 'error' : ''}
      help={error ? String(error) : ''}
    >
      <CheckboxAntd
        checked={field.value}
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
        disabled={disabled}
      >
        {renderLabel()}
      </CheckboxAntd>
    </Form.Item>
  );
};

export default Checkbox;
