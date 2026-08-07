import { Typography } from 'antd';

export default function Performance() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Dashboard - Performance</Typography.Title>
      <Typography.Paragraph>
        This is <code>/dashboard/performance</code> - a route this remote owns entirely. The container only
        knows about <code>/dashboard/*</code>; it has no idea this specific sub-route exists.
      </Typography.Paragraph>
    </div>
  );
}