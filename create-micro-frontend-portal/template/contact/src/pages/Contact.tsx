import { Typography } from 'antd';

export default function Contact() {
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Contact</Typography.Title>
      <Typography.Paragraph>
        This is <code>/contact</code> (the remote's index route). This component is exposed as{' '}
        <code>Contact/App</code> and federated into the container, but it also runs standalone via{' '}
        <code>npm start</code> in this folder. See <code>Form</code> for the other nested route this
        remote owns.
      </Typography.Paragraph>
    </div>
  );
}
