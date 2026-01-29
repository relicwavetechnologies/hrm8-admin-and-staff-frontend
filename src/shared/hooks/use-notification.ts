import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Centralized notification hook for consistent toast messages
 * across all CRUD operations and user interactions
 */
export const useNotification = () => {
  const showNotification = (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => {
    const { title, description, duration = 4000, action } = options || {};

    const toastOptions = {
      description: description || message,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        return toast.success(title || message, toastOptions);
      case 'error':
        return toast.error(title || message, toastOptions);
      case 'info':
        return toast.info(title || message, toastOptions);
      case 'warning':
        return toast.warning(title || message, toastOptions);
      case 'loading':
        return toast.loading(title || message, toastOptions);
      default:
        return toast(message, toastOptions);
    }
  };

  // Convenience methods for common operations
  const success = (message: string, options?: NotificationOptions) => 
    showNotification('success', message, options);

  const error = (message: string, options?: NotificationOptions) => 
    showNotification('error', message, options);

  const info = (message: string, options?: NotificationOptions) => 
    showNotification('info', message, options);

  const warning = (message: string, options?: NotificationOptions) => 
    showNotification('warning', message, options);

  const loading = (message: string, options?: NotificationOptions) => 
    showNotification('loading', message, options);

  // CRUD operation helpers
  const created = (entityName: string) => 
    success(`${entityName} created successfully`);

  const updated = (entityName: string) => 
    success(`${entityName} updated successfully`);

  const deleted = (entityName: string) => 
    success(`${entityName} deleted successfully`);

  const createFailed = (entityName: string, reason?: string) => 
    error(`Failed to create ${entityName}`, { description: reason });

  const updateFailed = (entityName: string, reason?: string) => 
    error(`Failed to update ${entityName}`, { description: reason });

  const deleteFailed = (entityName: string, reason?: string) => 
    error(`Failed to delete ${entityName}`, { description: reason });

  // Promise-based helper for async operations
  const promise = <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading,
      success: (data) => 
        typeof options.success === 'function' ? options.success(data) : options.success,
      error: (error) => 
        typeof options.error === 'function' ? options.error(error) : options.error,
    });
  };

  return {
    show: showNotification,
    success,
    error,
    info,
    warning,
    loading,
    created,
    updated,
    deleted,
    createFailed,
    updateFailed,
    deleteFailed,
    promise,
    dismiss: toast.dismiss,
  };
};
