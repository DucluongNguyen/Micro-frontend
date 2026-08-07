import { Typography } from 'antd';

export default function Overview() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Dashboard - Overview</Typography.Title>
      <Typography.Paragraph>
        This is <code>/dashboard</code> (the remote's index route). This component is exposed as{' '}
        <code>Dashboard/App</code> and federated into the container, but it also runs standalone via{' '}
        <code>npm start</code> in this folder. See <code>Stats</code> for the other nested route this
        remote owns.
      </Typography.Paragraph>
    </div>
  );
}
