import React, { useCallback, useRef } from 'react';
import { Select as SelectAntd, Form } from 'antd';
import type { SelectProps } from 'antd';
import { getIn } from 'formik';
import type { FieldProps } from 'formik';
import { debounce } from 'lodash';
import { colors } from '@/themes';

const { Option } = SelectAntd;

export interface SelectOption {
  label: string;
  value: string | number;
}

interface CommonSelectProps {
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  fetchOptions?: () => unknown;
  upperCase?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  searchable?: boolean;
  mode?: 'multiple' | 'tags';
  labelInValue?: boolean;
  onScrollToEnd?: () => void;
  afterOnchange?: (value: any) => void;
  onSearchApi?: (keyword: string) => void;
  required?: boolean;
  isFieldChange?: (name: string) => boolean;
}

const Select: React.FC<FieldProps & CommonSelectProps & SelectProps> = ({
  field,
  form,
  label,
  placeholder,
  options,
  fetchOptions,
  disabled = false,
  allowClear = true,
  searchable = false,
  mode,
  labelInValue = false,
  afterOnchange,
  onSearchApi,
  isFieldChange,
  required = false,
  ...rest
}) => {
  const error = getIn(form.errors, field.name);
  const touch = getIn(form.touched, field.name);
  const submitCount = form.submitCount;

  const hasFetchedRef = useRef(false);

  const resolvedOptions = options ?? [];

  const handleDropdownOpenChange = (open: boolean) => {
    if (open && fetchOptions && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOptions();
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchApi?.(value);
    }, 500),
    [onSearchApi],
  );

  const handleChange = (value: any) => {
    form.setFieldValue(field.name, value);
    // form.setFieldTouched(field.name, true, false);

    const selectedOption = resolvedOptions.find((opt) => opt.value === value);
    afterOnchange?.(selectedOption);
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
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
      {...rest}
      label={renderLabel()}
      validateStatus={error && (touch || submitCount > 0) ? 'error' : ''}
      help={error && (touch || submitCount > 0) ? String(error) : ''}
    >
      <SelectAntd
        style={{ minWidth: 120 }}
        {...rest}
        mode={mode}
        labelInValue={labelInValue}
        value={field.value}
        onChange={handleChange}
        onBlur={() => form.setFieldTouched(field.name, true)}
        onClear={() => {
          onSearchApi?.('');
        }}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        showSearch={searchable}
        onDropdownVisibleChange={handleDropdownOpenChange}
        filterOption={
          onSearchApi
            ? false
            : (input, option) => {
                const label: any = option?.children;

                if (typeof label === 'string') {
                  return removeVietnameseTones(label).includes(removeVietnameseTones(input));
                }

                return false;
              }
        }

        onSearch={
          searchable
            ? (value) => {
                if (onSearchApi) {
                  debouncedSearch(value);
                }
              }
            : undefined
        }
        onPopupScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 20) {
            rest.onScrollToEnd?.();
          }
        }}
      >
        {resolvedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </SelectAntd>
    </Form.Item>
  );
};

export default Select;
