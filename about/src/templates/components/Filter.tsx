import { Commons } from '@/components/commons';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Flex, Grid } from 'antd';
import { Field, Form, Formik, type FormikProps } from 'formik';
import { useEffect, useState, type ComponentType, type Ref } from 'react';
import * as styles from './Filter.module.scss';

const COLUMNS_BY_BREAKPOINT: [keyof ReturnType<typeof Grid.useBreakpoint>, number][] = [
  ['xxl', 6],
  ['xl', 5],
  ['lg', 4],
  ['md', 3],
  ['sm', 2],
];

function getActionsSpan(fieldCount: number, columns: number): number {
  const usedInLastRow = fieldCount % columns;
  const free = usedInLastRow === 0 ? columns : columns - usedInLastRow;
  return Math.min(2, free);
}

// Anchored to `columns - span + 1` through the grid's last column line
// (`-1`), instead of just `span N` left to auto-placement: an auto-placed
// item flows into the *first* free cell(s) of a row, which is the left edge
// once it falls through to a fresh row with nothing else on it (fields only
// ever occupy left-to-right from column 1). Pinning the start column
// explicitly makes it land in the right-most `span` columns of whichever
// row it ends up in - joining the fields' row flush right when there's
// room, or sitting alone flush right on a new row when there isn't either
// way, `getActionsSpan` already guarantees a next-column fit.
function getActionsGridColumn(columns: number, span: number): string {
  return `${columns - span + 1} / -1`;
}

type FilterValues = Record<string, unknown>;

/**
 * One filter field, declared as data instead of JSX: `component` is any
 * Formik-aware Commons control (`Commons.Select`, `Commons.Input`,
 * `Commons.DatePicker`, ...), `name` is its Formik field name, and
 * `componentProps` is whatever that specific component needs (placeholder,
 * options, searchable, onSearchApi, ...) - spread onto it as-is.
 */
export type FilterFieldConfig = {
  name: string;

  component: ComponentType<any>;
  componentProps?: Record<string, any>;
};

export type FilterProps = {
  fields?: FilterFieldConfig[];
  initialValues?: FilterValues;
  onSearch?: (values: FilterValues) => void;
  onReset?: () => void;
  loading?: boolean;
  formikRef?: Ref<FormikProps<FilterValues>>;
};

const Filter = ({ fields = [], initialValues = {}, onSearch, onReset, loading, formikRef }: FilterProps) => {
  const screens = Grid.useBreakpoint();
  const columns = COLUMNS_BY_BREAKPOINT.find(([bp]) => screens[bp])?.[1] ?? 1;
  const actionsSpan = getActionsSpan(fields.length, columns);
  const actionsGridColumn = getActionsGridColumn(columns, actionsSpan);
  const [pendingAction, setPendingAction] = useState<'reset' | 'search' | null>(null);

  useEffect(() => {
    if (!loading) {
      setPendingAction(null);
    }
  }, [loading]);

  const runFilterAction = () => {
    if (onReset) {
      onReset();
    } else {
      onSearch?.(initialValues);
    }
  };

  const handleReset = async (resetForm: () => void) => {
    setPendingAction('reset');
    await Promise.resolve(runFilterAction());
    resetForm();
  };

  const handleSearch = (values: FilterValues) => {
    setPendingAction('search');
    onSearch?.(values);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSearch} innerRef={formikRef}>
      {({ resetForm }) => (
        <Form>
          <div className={styles.row}>
            {fields.map(({ name, component, componentProps }) => (
              <div key={name} className={styles.field}>
                <Field component={component} name={name} {...componentProps} />
              </div>
            ))}

            <div className={styles.actions} style={{ gridColumn: actionsGridColumn }}>
              <Flex gap={8} justify="end">
                <Commons.Button
                  type="default"
                  icon={<ReloadOutlined />}
                  loading={loading && pendingAction === 'reset'}
                  disabled={loading && pendingAction === 'reset'}
                  onClick={() => handleReset(resetForm)}
                >
                  Làm mới bộ lọc
                </Commons.Button>
                <Commons.Button
                  loading={loading && pendingAction === 'search'}
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  disabled={loading && pendingAction === 'search'}
                >
                  Tìm kiếm
                </Commons.Button>
              </Flex>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Filter;
