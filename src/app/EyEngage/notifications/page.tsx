"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface NotificationItem {
  id: number;
  text: string;
  read: boolean;
  avatar: string;
}

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationsModal({ 
  notifications,
  onClose,
  onMarkAsRead
}: NotificationsModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-ey-black border-ey-dark-gray text-ey-white max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-2xl font-bold border-b border-ey-dark-gray p-4">
          Notifications
        </DialogHeader>
        <div className="space-y-4 p-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-3 rounded-lg ${
                !notif.read ? "bg-ey-dark-gray/50" : "bg-ey-dark-gray/20"
              } transition-colors`}
            >
              <div className="flex items-center gap-4">
                <img 
                  src={notif.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-ey-yellow/50"
                />
                <span className="flex-1 text-sm">{notif.text}</span>
                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-ey-yellow hover:bg-ey-dark-gray/50"
                    onClick={() => onMarkAsRead(notif.id)}
                  >
                    Marquer comme lu
                  </Button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center text-ey-white/50 py-8">
              Aucune notification
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}