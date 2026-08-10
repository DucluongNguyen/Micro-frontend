import { Typography } from 'antd';

export default function Home() {
  return (
    <div>
      <Typography.Title level={3}>Container base</Typography.Title>
      <Typography.Paragraph>
        This page is rendered locally by the container. Use the sidebar to open a federated remote -
        each one owns its own nested routes under its top-level path (e.g. Dashboard has
        <code> /dashboard</code> and <code>/dashboard/stats</code>).
      </Typography.Paragraph>
    </div>
  );
}
