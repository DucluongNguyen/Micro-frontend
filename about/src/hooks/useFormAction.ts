import { useState } from 'react';

export enum FormAction {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  CREATE = 'CREATE',
}

export const useFormAction = () => {
  const [action, setAction] = useState<FormAction | null>(null);

  return { action, setAction };
};
