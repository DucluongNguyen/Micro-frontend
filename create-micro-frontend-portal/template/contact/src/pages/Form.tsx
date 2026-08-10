import { Typography } from 'antd';

export default function Form() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Contact - Form</Typography.Title>
      <Typography.Paragraph>
        This is <code>/contact/form</code> - a route this remote owns entirely. The container only
        knows about <code>/contact/*</code>; it has no idea this specific sub-route exists.
      </Typography.Paragraph>
    </div>
  );
}
