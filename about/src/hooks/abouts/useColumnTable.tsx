import { Commons } from '@/components/commons';
import type { ColumnsType } from 'antd/es/table';

export type ColumnTableType = {
  id: string;
  title: string;
  body: string;
  action: any;
};

type Props = {
  fieldItems: any[][];
  title: string;
  validationSchema: any;
  apiEditUrl: string;
  apiDetailUrl: string;
  isViewPermission: string;
  isEditPermission: string;
};

export const useColumnTable = ({ fieldItems, title, validationSchema, ...rest }: Props) => {
  const columns: ColumnsType<ColumnTableType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: ColumnTableType) => (
        <Commons.ApprovedAction
          record={record}
          fieldItems={fieldItems}
          titleModal={title}
          validationSchema={validationSchema}
          {...rest}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Body',
      dataIndex: 'body',
      key: 'body',
    },
  ];

  return { columns };
};
