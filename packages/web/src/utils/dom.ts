/**
 * DOM 工具函数
 */

export const dom = {
  // 获取元素
  getElementById: (id: string): HTMLElement | null => document.getElementById(id),
  
  // 查询选择器
  querySelector: (selector: string): Element | null => document.querySelector(selector),
  querySelectorAll: (selector: string): NodeListOf<Element> => document.querySelectorAll(selector),
  
  // 元素可见性检查
  isVisible: (element: HTMLElement): boolean => {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  },
  
  // 滚动到元素
  scrollIntoView: (element: HTMLElement, options?: ScrollIntoViewOptions): void => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', ...options });
  },
  
  // 添加/移除类
  addClass: (element: HTMLElement, className: string): void => {
    element.classList.add(className);
  },
  removeClass: (element: HTMLElement, className: string): void => {
    element.classList.remove(className);
  },
  toggleClass: (element: HTMLElement, className: string): void => {
    element.classList.toggle(className);
  },
  
  // 设置/获取属性
  setAttribute: (element: HTMLElement, name: string, value: string): void => {
    element.setAttribute(name, value);
  },
  getAttribute: (element: HTMLElement, name: string): string | null => {
    return element.getAttribute(name);
  },
  
  // 事件处理
  addEventListener: (element: HTMLElement, event: string, handler: EventListener): void => {
    element.addEventListener(event, handler);
  },
  removeEventListener: (element: HTMLElement, event: string, handler: EventListener): void => {
    element.removeEventListener(event, handler);
  },
};