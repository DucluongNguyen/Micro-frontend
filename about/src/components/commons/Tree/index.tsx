import React, { useMemo, useState, useEffect } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import EmptyData from '../Empty';

interface CommonTreeProps {
  treeData?: TreeDataNode[];
  searchValue?: string;
}

const CommonTree: React.FC<CommonTreeProps> = ({
  treeData: initData = [],
  searchValue = '',
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // flatten tree
  const dataList = useMemo(() => {
    const list: { key: React.Key; title: string }[] = [];

    const generateList = (data: TreeDataNode[]) => {
      data.forEach((node) => {
        list.push({ key: node.key, title: node.title as string });
        if (node.children) {
          generateList(node.children);
        }
      });
    };

    generateList(initData);
    return list;
  }, [initData]);

  const getParentKey = (
    key: React.Key,
    tree: TreeDataNode[],
  ): React.Key | null => {
    let parentKey: React.Key | null = null;

    for (const node of tree) {
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key;
        } else {
          const found = getParentKey(key, node.children);
          if (found) parentKey = found;
        }
      }
    }

    return parentKey;
  };

  // update expandedKeys khi searchValue thay đổi
  useEffect(() => {
    if (!searchValue) {
      setExpandedKeys([]);
      return;
    }

    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.toLowerCase().includes(searchValue.toLowerCase())) {
          return getParentKey(item.key, initData);
        }
        return null;
      })
      .filter(
        (item, i, self): item is React.Key =>
          !!item && self.indexOf(item) === i,
      );

    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(true);
  }, [searchValue, dataList, initData]);

  const onExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  // highlight
  const treeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());

        const title =
          index > -1 && searchValue ? (
            <span>
              {strTitle.substring(0, index)}
              <span style={{ color: 'red' }}>
                {strTitle.substring(index, index + searchValue.length)}
              </span>
              {strTitle.substring(index + searchValue.length)}
            </span>
          ) : (
            <span>{strTitle}</span>
          );

        if (item.children) {
          return {
            ...item,
            title,
            children: loop(item.children),
          };
        }

        return {
          ...item,
          title,
        };
      });

    return loop(initData);
  }, [searchValue, initData]);

  if (!initData || initData.length === 0) {
    return <EmptyData />;
  }

  return (
    <Tree
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
};

export default CommonTree;
