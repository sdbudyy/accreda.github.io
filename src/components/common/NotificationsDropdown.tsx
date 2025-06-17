import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { useNotificationsStore, Notification } from '../../store/notifications';
import { formatDistanceToNow, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowFullHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8, // 8px margin below the button
        left: rect.right - 320, // dropdown width is 320px (w-80)
      });
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type and data
    switch (notification.type) {
      case 'validation_request':
        navigate('/dashboard/supervisor/reviews');
        break;
      case 'request':
        navigate('/dashboard/supervisor/team');
        break;
      case 'score':
        navigate('/dashboard/skills');
        break;
      case 'approval':
        navigate('/dashboard/skills');
        break;
      case 'sao_feedback':
        navigate('/dashboard/supervisor/reviews');
        break;
    }
    setIsOpen(false);
    setShowFullHistory(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'request':
        return '📝';
      case 'score':
        return '⭐';
      case 'approval':
        return '✅';
      case 'validation_request':
        return '🔍';
      case 'sao_feedback':
        return '📝';
      case 'nudge':
        return '📣';
      default:
        return '📬';
    }
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
        !notification.read ? 'bg-slate-50' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1">
          <p className="font-medium text-slate-800">{notification.title}</p>
          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
          <p className="text-xs text-slate-500 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2"></span>
        )}
      </div>
    </div>
  );

  const recentNotifications = notifications.slice(0, 5);
  const twoWeeksAgo = subWeeks(new Date(), 2);
  const recentNotificationsFiltered = notifications.filter(
    notification => new Date(notification.created_at) >= twoWeeksAgo
  );

  return (
    <div className="relative inline-block">
      <button
        ref={bellButtonRef}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown menu (portalized, fixed, positioned below bell) */}
      {isOpen && !showFullHistory && dropdownPos && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-[9999]"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowFullHistory(true)}
                className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <Clock size={14} />
                View more
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map(renderNotification)
            ) : (
              <div className="p-4 text-center text-slate-500">
                No notifications
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Portal for full history overlay */}
      {showFullHistory && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 min-h-screen bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Notification History</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setShowFullHistory(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {recentNotificationsFiltered.length > 0 ? (
                recentNotificationsFiltered.map(renderNotification)
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No notifications in the last 2 weeks
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default React.memo(NotificationsDropdown); 