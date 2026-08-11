import React, { useCallback } from 'react';
import { Empty, Popconfirm, Spin, Tooltip } from 'antd';
import {
  DashOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Tree as OrgChartTree,
  TreeNode as OrgChartTreeNode,
} from 'react-organizational-chart';
import { JOB_TITLE_LABEL, ROLE_LABEL } from '@/contants/enum';

export interface OrgNodeData {
  key: string;
  username: string;
  responsibility: string;
  jobTitle: string;
  fullname?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  branch?: string;
  department?: string;
  hasChildren: boolean;
  childrenLoaded: boolean;
  children: OrgNodeData[];
  meta?: Record<string, unknown>;
}

export interface OrgTreeProps {
  root: OrgNodeData | null;
  isHighlighted?: (node: OrgNodeData) => boolean;
  loadingNodeKey?: string | null;
  loading?: boolean;
  onNodeClick: (node: OrgNodeData) => void;
  onLoadChildren: (node: OrgNodeData) => void;
  onEdit: (node: OrgNodeData) => void;
  onDelete: (node: OrgNodeData) => void;
  onAddChild: (node: OrgNodeData) => void;
}

const roleLabel = (r: string) =>
  ROLE_LABEL[r as keyof typeof ROLE_LABEL] || r || '—';
const jobLabel = (j: string) =>
  JOB_TITLE_LABEL[j as keyof typeof JOB_TITLE_LABEL] || j || '—';

interface ActionBarProps {
  node: OrgNodeData;
  onEdit: (node: OrgNodeData) => void;
  onDelete: (node: OrgNodeData) => void;
  onAddChild: (node: OrgNodeData) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  node,
  onEdit,
  onDelete,
  onAddChild,
}) => (
  <span
    style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    onClick={(e) => e.stopPropagation()}
  >
    <Tooltip title="Thêm cấp dưới">
      <PlusCircleOutlined
        style={{ color: '#52c41a', cursor: 'pointer', fontSize: 14 }}
        onClick={() => onAddChild(node)}
      />
    </Tooltip>

    <Tooltip title="Sửa">
      <EditOutlined
        style={{ color: '#faad14', cursor: 'pointer', fontSize: 14 }}
        onClick={() => onEdit(node)}
      />
    </Tooltip>

    <Popconfirm
      title="Xác nhận xoá?"
      description={`Xoá node "${node.username}" khỏi cây?`}
      okText="Xoá"
      cancelText="Huỷ"
      okButtonProps={{ danger: true }}
      onConfirm={() => onDelete(node)}
    >
      <Tooltip title="Xoá">
        <DeleteOutlined
          style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 14 }}
        />
      </Tooltip>
    </Popconfirm>
  </span>
);

interface OrgCardProps {
  node: OrgNodeData;
  isHighlighted: boolean;
  isLoading: boolean;
  onClick: (node: OrgNodeData) => void;
  onEdit: (node: OrgNodeData) => void;
  onDelete: (node: OrgNodeData) => void;
  onAddChild: (node: OrgNodeData) => void;
}

const OrgCard: React.FC<OrgCardProps> = ({
  node,
  isHighlighted,
  isLoading,
  onClick,
  onEdit,
  onDelete,
  onAddChild,
}) => (
  <div
    onClick={() => onClick(node)}
    style={{
      display: 'inline-block',
      padding: '8px 14px 10px',
      border: `1.5px solid ${isHighlighted ? '#ff7300' : '#d9d9d9'}`,
      borderRadius: 8,
      background: isHighlighted ? '#fff7e6' : '#fff',
      cursor: 'pointer',
      minWidth: 180,
      textAlign: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      transition: 'border-color 0.2s',
      position: 'relative',
      userSelect: 'none',
    }}
  >
    {isLoading ? (
      <Spin
        size="small"
        indicator={<LoadingOutlined />}
        style={{ position: 'absolute', top: 4, right: 6 }}
      />
    ) : (
      node.hasChildren &&
      !node.childrenLoaded && (
        <DashOutlined style={{ position: 'absolute', top: 4, right: 6 }} />
      )
    )}

    <div style={{ fontWeight: 700, color: '#1677ff', fontSize: 13 }}>
      {node.username}
    </div>
    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
      {roleLabel(node.responsibility)}
    </div>
    <div style={{ fontSize: 11, color: '#555' }}>{jobLabel(node.jobTitle)}</div>

    <div
      style={{
        borderTop: '1px solid #f0f0f0',
        marginTop: 8,
        paddingTop: 6,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ActionBar
        node={node}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChild={onAddChild}
      />
    </div>
  </div>
);

const OrgTree: React.FC<OrgTreeProps> = ({
  root,
  isHighlighted,
  loadingNodeKey,
  loading = false,
  onNodeClick,
  onLoadChildren,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const handleNodeClick = useCallback(
    (node: OrgNodeData) => {
      onNodeClick(node);
      if (node.hasChildren && !node.childrenLoaded) {
        onLoadChildren(node);
      }
    },
    [onNodeClick, onLoadChildren],
  );

  const renderNodes = useCallback(
    (node: OrgNodeData): React.ReactNode => {
      const card = (
        <OrgCard
          node={node}
          isHighlighted={isHighlighted?.(node) ?? false}
          isLoading={loadingNodeKey === node.key}
          onClick={handleNodeClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      );

      if (node.children.length === 0) {
        return <OrgChartTreeNode key={node.key} label={card} />;
      }

      return (
        <OrgChartTreeNode key={node.key} label={card}>
          {node.children.map((child) => renderNodes(child))}
        </OrgChartTreeNode>
      );
    },
    [
      isHighlighted,
      loadingNodeKey,
      handleNodeClick,
      onEdit,
      onDelete,
      onAddChild,
    ],
  );

  if (!root) {
    return <Empty description="Không có dữ liệu" style={{ padding: 40 }} />;
  }

  return (
    <Spin spinning={loading}>
      <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
        <OrgChartTree
          lineWidth="2px"
          lineColor="#d9d9d9"
          lineBorderRadius="6px"
          label={
            <OrgCard
              node={root}
              isHighlighted={isHighlighted?.(root) ?? false}
              isLoading={loadingNodeKey === root.key}
              onClick={handleNodeClick}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          }
        >
          {root.children.map((child) => renderNodes(child))}
        </OrgChartTree>
      </div>
    </Spin>
  );
};

export default OrgTree;
