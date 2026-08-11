import { Commons } from '@/components/commons';
import type { CommonTableProps } from '@/components/commons/Table';

export type TableProps<RecordType extends object = object> = Partial<CommonTableProps<RecordType>>;

const Table = <RecordType extends object = object>({
  data = [],
  columns = [],
  loading = false,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange = () => {},
  ...rest
}: TableProps<RecordType>) => {
  return (
    <Commons.Table<RecordType>
      data={data}
      columns={columns}
      loading={loading}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      scroll={{ x: 'max-content' }}
      {...rest}
    />
  );
};

export default Table;
