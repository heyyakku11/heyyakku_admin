export type NotificationType =
    | 'user'
    | 'poll'
    | 'category'
    | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}