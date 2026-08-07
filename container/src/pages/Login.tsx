import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/store';
import { login, type LoginCredentials } from '@/store/slices/authSlice';

interface LocationState {
  from?: string;
}

/**
 * Public route - the only page reachable without a session (see
 * src/components/RequireAuth.tsx and src/router/routes.tsx). Submits
 * through the `login` thunk in authSlice.ts, which is a skeleton mock: wire
 * its body to a real endpoint when this base becomes a real app, and this
 * page needs no changes.
 */
export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, status, error } = useAuth();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from ?? '/';

  // Already authenticated (e.g. navigated here directly via the URL) - bounce
  // straight back instead of showing the form again.
  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  const onFinish = async (values: LoginCredentials) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
          Container
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Sign in to continue
        </Typography.Paragraph>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form<LoginCredentials> layout="vertical" onFinish={onFinish} disabled={status === 'loading'}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input prefix={<UserOutlined />} autoFocus autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={status === 'loading'} block>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0, fontSize: 12 }}>
          Demo only: any non-empty username/password signs you in - see the `login` thunk in
          src/store/slices/authSlice.ts.
        </Typography.Paragraph>
      </Card>
    </Flex>
  );
}
