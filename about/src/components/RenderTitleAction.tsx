import { FormAction } from '@/hooks/useFormAction';

type Props = {
  action: FormAction | null;
  title: string;
};

const RenderTitleAction = (props: Props) => {
  // !State
  const { action, title } = props;

  const renderTitle = () => {
    switch (action) {
      case FormAction.CREATE:
        return `Thêm mới ${title}`;
      case FormAction.EDIT:
        return `Chỉnh sửa ${title}`;
      case FormAction.VIEW:
        return `Chi tiết ${title}`;
      default:
        return '';
    }
  };

  // !Render
  return <>{renderTitle()}</>;
};

export default RenderTitleAction;
