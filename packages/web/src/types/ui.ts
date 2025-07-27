/**
 * UI 组件相关类型定义
 */

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button-variants';
import { cardVariants } from '@/components/ui/card-variants';

// 基础 UI 组件 Props
export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
}

// 按钮组件类型
export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    BaseUIProps {
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// 卡片组件类型
export interface CardProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants>,
    BaseUIProps {}

// 输入组件类型
export interface InputProps extends BaseUIProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'number';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  description?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// 加载状态组件类型
export interface LoadingProps extends BaseUIProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
}

// 模态框类型
export interface ModalProps extends BaseUIProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

// 通知组件类型
export interface NotificationProps extends BaseUIProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}

// 表格组件类型
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> extends BaseUIProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
}

// 表单相关类型
export interface FormFieldProps extends BaseUIProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

export interface FormProps extends BaseUIProps {
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  loading?: boolean;
}

// 布局组件类型
export interface LayoutProps extends BaseUIProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// 导航组件类型
export interface NavigationItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
  disabled?: boolean;
  badge?: string | number;
}

export interface NavigationProps extends BaseUIProps {
  items: NavigationItem[];
  activeKey?: string;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  onItemClick?: (item: NavigationItem) => void;
}