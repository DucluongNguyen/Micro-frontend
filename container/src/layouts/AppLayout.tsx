import { useRemoteNavigation } from '@/hooks/useRemoteNavigation';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useAuth } from '@/store/store';
import {
  AimOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { ComponentType } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// Maps the icon *name* each remote's `./navigation` module exports (a plain
// string - see portal-relationship/base/src/navigation.ts) to the actual
// @ant-design/icons component. Keeping this lookup in the container, rather
// than having remotes export components directly, is what lets a remote's
// `./navigation` stay plain serializable data with zero antd/React imports.
const ICONS: Record<string, ComponentType> = {
  AppstoreOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  AimOutlined,
  PhoneOutlined,
  FormOutlined,
  ThunderboltOutlined,
};

function resolveIcon(name: string | undefined) {
  if (!name) return undefined;
  const Icon = ICONS[name];
  return Icon ? <Icon /> : undefined;
}

/**
 * Container shell: fixed Sidebar + Header, routed content in the middle via
 * <Outlet />. The sidebar is built dynamically from each remote's exposed
 * `./navigation` module (see src/hooks/useRemoteNavigation.ts), without the
 * container hardcoding what those routes are.
 *
 * Each remote renders as a collapsible antd SubMenu: collapsed by default
 * (arrow pointing right), and expands in place (arrow rotates to point down)
 * to reveal its nested routes on click - antd's built-in SubMenu behavior,
 * so no custom expand/collapse or icon-rotation logic is needed here.
 *
 * Route registration itself still lives in src/router/routes.tsx as
 * `/<name>/*`; this file only renders links into those already-mounted paths.
 */
export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sections = useRemoteNavigation();
  const { user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', onClick: handleLogout },
  ];

  const remoteMenuItems: MenuProps['items'] = sections.map((section) => ({
    // Distinct from every child item's key below: a section's index route
    // (`{ path: '', ... }` in the remote's `./navigation`) resolves to
    // `fullPath === section.mountPath`, so using `section.mountPath` here
    // too would give the SubMenu and its own child item the same key - antd
    // Menu keys must be unique across the *whole* tree, not just per level,
    // and reusing one triggers "Duplicated key ... used in Menu by path
    // [dashboard > dashboard]".
    key: `group:${section.mountPath}`,
    label: section.label,
    icon: resolveIcon(section.icon),
    children: section.failed
      ? [
          {
            key: `${section.mountPath}::unavailable`,
            icon: <ExclamationCircleOutlined />,
            label: <Link to={section.mountPath}>{section.label} (unavailable)</Link>,
          },
        ]
      : section.items.map((item) => ({
          key: item.fullPath,
          icon: resolveIcon(item.icon),
          label: <Link to={item.fullPath}>{item.label}</Link>,
        })),
  }));

  const items: MenuProps['items'] = [{ key: '/', label: <Link to="/">Home</Link> }, ...remoteMenuItems];

  // Longest-prefix match against every known nested path, so a route like
  // /dashboard/stats highlights "Stats" and not just the "Dashboard" group.
  const allItemPaths = sections.flatMap((section) => section.items.map((item) => item.fullPath));
  const selectedKey =
    [...allItemPaths].sort((a, b) => b.length - a.length).find((path) => location.pathname.startsWith(path)) ?? '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, padding: 16 }}>Container</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={items} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            paddingInline: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <strong>Portal</strong>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} />}>
              {user?.username ?? 'Account'}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
