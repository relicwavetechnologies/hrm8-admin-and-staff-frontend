import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Check } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Mock notifications for now
        setNotifications([
            { id: 1, title: 'New Commission', message: 'You have a new commission pending approval.', read: false, createdAt: new Date().toISOString() },
            { id: 2, title: 'System Update', message: 'HRM8 was updated successfully.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">View and manage your alerts</p>
                </div>
                <Button variant="outline" size="sm">
                    <Check className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <Card key={notification.id} className={notification.read ? 'opacity-70' : ''}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <CardTitle className="text-base">{notification.title}</CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {notification.message}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
