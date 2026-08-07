import { Typography } from 'antd';

export default function Stats() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Dashboard - Stats</Typography.Title>
      <Typography.Paragraph>
        This is <code>/dashboard/stats</code> - a route this remote owns entirely. The container only
        knows about <code>/dashboard/*</code>; it has no idea this specific sub-route exists.
      </Typography.Paragraph>
    </div>
  );
}
