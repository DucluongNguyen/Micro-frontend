import { Typography } from 'antd';

export default function About() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>About</Typography.Title>
      <Typography.Paragraph>
        This is <code>/about</code> (the remote's index route). This component is exposed as{' '}
        <code>About/App</code> and federated into the container, but it also runs standalone via{' '}
        <code>npm start</code> in this folder. See <code>Mission</code> for the other nested route this
        remote owns.
      </Typography.Paragraph>
    </div>
  );
}
