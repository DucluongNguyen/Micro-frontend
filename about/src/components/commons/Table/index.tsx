import React from 'react';
import { Table as TableAntd, TableProps, PaginationProps } from 'antd';
import { uniqueId } from 'lodash';

export interface CommonTableProps<RecordType> extends Omit<
  TableProps<RecordType>,
  'pagination' | 'onChange'
> {
  loading: boolean;
  data: RecordType[];
  columns: TableProps<RecordType>['columns'];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  isHidePagination?: boolean;
}

const Table = <RecordType extends object = any>({
  data,
  columns,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  rowKey = uniqueId(),
  isHidePagination = false,
  ...rest
}: CommonTableProps<RecordType>) => {
  const paginationConfig: PaginationProps = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    onChange: onPageChange,
    onShowSizeChange: onPageChange,
  };

  return (
    <TableAntd<RecordType>
      rowKey={rowKey}
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={isHidePagination ? false : paginationConfig}
      bordered
      rowClassName={() => 'hover-table-row'}
      scroll={{ x: 1200 }}
      {...rest}
    />
  );
};

export default Table;
