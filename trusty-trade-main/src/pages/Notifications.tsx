import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore, type NotificationType } from '@/store/useNotificationStore';
import { 
  Bell, Package, Shield, CreditCard, 
  CheckCircle2, AlertCircle, Info, 
  Clock, Trash2, Truck, ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Notifications = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll
  } = useNotificationStore();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order': return Package;
      case 'security': return Shield;
      case 'payment': return CreditCard;
      case 'escrow': return Shield;
      case 'delivery': return Truck;
      case 'product': return ShoppingBag;
      case 'dispute': return AlertCircle;
      case 'system': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType, priority: string) => {
    if (priority === 'high') return 'text-destructive';
    switch (type) {
      case 'order': return 'text-primary';
      case 'security': return 'text-warning';
      case 'payment': return 'text-success';
      case 'escrow': return 'text-primary';
      case 'delivery': return 'text-primary';
      case 'product': return 'text-success';
      case 'dispute': return 'text-destructive';
      case 'system': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast({ title: "Marked as Read" });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({ title: "All Notifications Read", description: `Marked ${unreadCount} notifications as read` });
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    toast({ title: "Notification Removed" });
  };

  const handleClearAll = () => {
    clearAll();
    toast({ title: "All Notifications Cleared", description: "Your notification list has been cleared." });
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { value: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length },
    { value: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
  ];

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your orders, security alerts, and system updates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <CheckCircle2 className="h-4 w-4 mr-2" />Mark All Read
            </Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={notifications.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.priority === 'high').length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.type === 'order').length}</p>
                <p className="text-sm text-muted-foreground">Order Updates</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-75">({option.count})</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications yet. They will appear here when you have activity.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`bg-card rounded-xl border transition-all hover:shadow-md ${
                    notification.read ? 'border-border' : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-5 w-5 ${getNotificationColor(notification.type, notification.priority)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground">{notification.title}</h3>
                              {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                              <Badge variant="outline" className={getPriorityBadge(notification.priority)}>{notification.priority}</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.orderId && <span>Order: {notification.orderId}</span>}
                              {notification.actionUrl && (
                                <Link to={notification.actionUrl} className="text-primary hover:underline">View Details</Link>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)} title="Mark as read">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)} title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
