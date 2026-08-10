import { Typography } from 'antd';

export default function Mission() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>About - Mission</Typography.Title>
      <Typography.Paragraph>
        This is <code>/about/mission</code> - a route this remote owns entirely. The container only
        knows about <code>/about/*</code>; it has no idea this specific sub-route exists.
      </Typography.Paragraph>
    </div>
  );
}
