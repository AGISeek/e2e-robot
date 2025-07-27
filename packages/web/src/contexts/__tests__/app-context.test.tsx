/**
 * 应用状态管理测试
 */

import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AppStateProvider, useApp } from '@/contexts/app-context';
import { createTestData } from '@/test-utils';

// 测试包装器
const wrapper = ({ children }: { children: ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe('useApp Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.state.preferences.theme).toBe('system');
    expect(result.current.state.sidebarOpen).toBe(true);
    expect(result.current.state.notifications).toHaveLength(0);
    expect(result.current.state.globalLoading).toBe(false);
    expect(result.current.computed.hasNotifications).toBe(false);
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.actions.toggleSidebar();
    });

    expect(result.current.state.sidebarOpen).toBe(false);

    act(() => {
      result.current.actions.toggleSidebar();
    });

    expect(result.current.state.sidebarOpen).toBe(true);
  });

  it('should manage notifications', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const notification = createTestData.notification({
      type: 'success',
      title: 'Test Success',
    });

    act(() => {
      result.current.actions.addNotification(notification);
    });

    expect(result.current.state.notifications).toHaveLength(1);
    expect(result.current.computed.hasNotifications).toBe(true);
    expect(result.current.state.notifications[0].title).toBe('Test Success');

    const notificationId = result.current.state.notifications[0].id;

    act(() => {
      result.current.actions.removeNotification(notificationId);
    });

    expect(result.current.state.notifications).toHaveLength(0);
    expect(result.current.computed.hasNotifications).toBe(false);
  });

  it('should manage modal stack', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.computed.currentModal).toBeNull();
    expect(result.current.computed.hasModals).toBe(false);

    act(() => {
      result.current.actions.pushModal('test-modal-1');
    });

    expect(result.current.computed.currentModal).toBe('test-modal-1');
    expect(result.current.computed.hasModals).toBe(true);

    act(() => {
      result.current.actions.pushModal('test-modal-2');
    });

    expect(result.current.computed.currentModal).toBe('test-modal-2');

    act(() => {
      result.current.actions.popModal();
    });

    expect(result.current.computed.currentModal).toBe('test-modal-1');

    act(() => {
      result.current.actions.clearModals();
    });

    expect(result.current.computed.currentModal).toBeNull();
    expect(result.current.computed.hasModals).toBe(false);
  });

  it('should set global loading state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.actions.setGlobalLoading(true, 'Loading test...');
    });

    expect(result.current.state.globalLoading).toBe(true);
    expect(result.current.state.loadingMessage).toBe('Loading test...');
    expect(result.current.computed.isLoading).toBe(true);

    act(() => {
      result.current.actions.setGlobalLoading(false);
    });

    expect(result.current.state.globalLoading).toBe(false);
    expect(result.current.computed.isLoading).toBe(false);
  });

  it('should update user preferences', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.actions.setPreferences({
        theme: 'dark',
        pageSize: 20,
      });
    });

    expect(result.current.state.preferences.theme).toBe('dark');
    expect(result.current.state.preferences.pageSize).toBe(20);
    // 其他偏好设置应该保持不变
    expect(result.current.state.preferences.language).toBe('zh-CN');
  });

  it('should provide notification helpers', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.notify.success('Success Title', 'Success message');
    });

    expect(result.current.state.notifications).toHaveLength(1);
    expect(result.current.state.notifications[0].type).toBe('success');
    expect(result.current.state.notifications[0].title).toBe('Success Title');
    expect(result.current.state.notifications[0].message).toBe('Success message');

    act(() => {
      result.current.notify.error('Error Title');
    });

    expect(result.current.state.notifications).toHaveLength(2);
    expect(result.current.state.notifications[1].type).toBe('error');
    expect(result.current.state.notifications[1].title).toBe('Error Title');
  });

  it('should reset app state while preserving preferences', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // 设置一些状态
    act(() => {
      result.current.actions.setPreferences({ theme: 'dark' });
      result.current.actions.setSidebarOpen(false);
      result.current.actions.addNotification(createTestData.notification());
      result.current.actions.pushModal('test-modal');
    });

    expect(result.current.state.preferences.theme).toBe('dark');
    expect(result.current.state.sidebarOpen).toBe(false);
    expect(result.current.state.notifications).toHaveLength(1);
    expect(result.current.state.modalStack).toHaveLength(1);

    // 重置状态
    act(() => {
      result.current.actions.resetAppState();
    });

    // 偏好设置应该保留
    expect(result.current.state.preferences.theme).toBe('dark');
    // 其他状态应该重置
    expect(result.current.state.sidebarOpen).toBe(true);
    expect(result.current.state.notifications).toHaveLength(0);
    expect(result.current.state.modalStack).toHaveLength(0);
  });
});