export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePicture: string | null;
  roles: string[];
  fonction: string | null;
  sector: string | null;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileEvents {
  organizedEvents: Array<EventItem>;
  participatedEvents: Array<EventItem>;
  approvedEvents: Array<EventItem>;
  approvedParticipations: Array<ParticipationItem>;
  comments: Array<CommentItem>;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  imagePath: string | null;
}

export interface ParticipationItem {
  participationId: string;
  eventId: string;
  eventTitle: string;
    participantFullName:string;
  participantProfilePicture: string;
}

export interface CommentItem {
  commentId: string;
  eventId: string;
  eventTitle: string;
  content: string;


}
export interface EventAnalyticsDto {
  totalEvents: number;
  totalParticipants: number;
  totalInterests: number;
  avgParticipationPerEvent: number;
  participationRate: number;
  popularEvents: PopularEventDto[];
  departmentStats: DepartmentStatsDto[];
  monthlyStats: MonthlyStatsDto[];
}

export interface PopularEventDto {
  eventId: string;
  title: string;
  date: string;
  participants: number;
  interests: number;
}

export interface DepartmentStatsDto {
  departmentId: string;
  departmentName: string;
  totalEvents: number;
  totalParticipants: number;
  totalInterests: number;
}

export interface MonthlyStatsDto {
  year: number;
  month: number;
  eventsCount: number;
  participantsCount: number;
  interestsCount: number;
}

export interface EventTrendDto {
  eventId: string;
  title: string;
  date: string;
  participants: number;
  interests: number;
  conversionRate: number;
}
// Définition des types pour le module Career
export enum Department {
  Assurance = "Assurance",
  Consulting = "Consulting",
  StrategyAndTransactions = "StrategyAndTransactions",
  Tax = "Tax"
}

export enum JobType {
  FullTime = "FullTime",
  PartTime = "PartTime",
  Contract = "Contract",
  Internship = "Internship"
}

export interface CandidateRecommendation {
  id: string; 
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  resumeFilePath?: string;
  appliedAt: string;
  status: 'Pending' | 'Selected' | 'Rejected';
  score: number;
  justification: string;
  isPreSelected: boolean;
  jobOfferId: string;
  recommendedByUserId?: string;
  recommenderName?: string;
}

export interface JobApplicationDto {
  id: string;
  jobOfferId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  resumeFilePath?: string;
  appliedAt: string;
  status: 'Pending' | 'Selected' | 'Rejected';
  isPreSelected: boolean;
  score?: number;
  justification?: string;
  recommendedByUserId?: string;
  recommenderName?: string;
}

export interface JobOfferDto {
  id: string;
  title: string;
  description: string;
  keySkills: string;
  experienceLevel: string;
  location: string;
  publishDate: string;
  closeDate: string;
  isActive: boolean;
  publisherId: string;
  department: string;
  jobType: string;
  applicationsCount: number;
}

export interface ApplicationData {
  applicationId: string;
  candidateName: string;
  resumeText: string;
  coverLetter: string;
  
}
export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  fonction?: string;
  department?: string;
  sector?: string;
}
export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_APPROVED = 'EVENT_APPROVED',
  EVENT_REJECTED = 'EVENT_REJECTED',
  PARTICIPATION_REQUESTED = 'PARTICIPATION_REQUESTED',
  PARTICIPATION_APPROVED = 'PARTICIPATION_APPROVED',
  PARTICIPATION_REJECTED = 'PARTICIPATION_REJECTED',
  JOB_APPLICATION = 'JOB_APPLICATION',
  JOB_INTERVIEW = 'JOB_INTERVIEW',
  POST_LIKED = 'POST_LIKED',
  POST_COMMENTED = 'POST_COMMENTED',
  POST_SHARED = 'POST_SHARED',
  USER_FOLLOWED = 'USER_FOLLOWED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  CONVERSATION_CREATED = 'CONVERSATION_CREATED',
  MENTION = 'MENTION',
  REPLY = 'REPLY',
  REACTION = 'REACTION'
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  content: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  targetId?: string;
  targetType?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface BulkNotificationDto {
  userIds?: string[];
  type: NotificationType;
  title: string;
  content: string;
  senderId?: string;
  senderName?: string;
  data?: Record<string, any>;
  actionUrl?: string;
  departmentFilter?: string;
  roleFilter?: string[];
}

export interface SystemAnnouncementDto {
  title: string;
  content: string;
  targetDepartments?: string[];
  targetRoles?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: NotificationType[];
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readRate: number;
  typeStats: {
    type: string;
    count: number;
    readRate: number;
  }[];
}


// ============================================
// TYPES POUR CHAT
// ============================================

// types/chat.ts
export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  DEPARTMENT = 'DEPARTMENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM'
}

export interface ConversationDto {
  id: string;
  type: ConversationType;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  creatorProfilePicture?: string;
  department?: string;
  isActive: boolean;
  isPrivate: boolean;
  lastMessageAt?: Date;
  lastMessage?: string;
  lastMessageById?: string;
  lastMessageByName?: string;
  messagesCount: number;
  participantsCount: number;
  tags?: string[];
  avatar?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  // UI specific
  unreadCount?: number;
  lastSeenAt?: Date;
  userRole?: 'owner' | 'admin' | 'member';
  isMuted?: boolean;
  canSendMessages?: boolean;
  canAddParticipants?: boolean;
  canDeleteMessages?: boolean;
  participants?: ParticipantDto[];
}

export interface CreateConversationDto {
  type: ConversationType;
  name?: string;
  description?: string;
  participantIds?: string[];
  department?: string;
  isPrivate?: boolean;
  tags?: string[];
  settings?: Record<string, any>;
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  settings?: Record<string, any>;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderProfilePicture?: string;
  senderDepartment: string;
  type: MessageType;
  content: string;
  attachments?: string[];
  mentions?: string[];
  replyToId?: string;
  replyToContent?: string;
  replyToSenderName?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isSystem: boolean;
  isPinned: boolean;
  reactionsCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedById?: string;
  // UI specific
  canEdit?: boolean;
  canDelete?: boolean;
  canReact?: boolean;
  isRead?: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  reactions?: MessageReactionDto[];
}

export interface SendMessageDto {
  conversationId: string;
  type: MessageType;
  content: string;
  attachments?: string[];
  mentions?: string[];
  replyToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMessageDto {
  content?: string;
  mentions?: string[];
  attachments?: string[];
}

export interface ParticipantDto {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: string;
  role: 'owner' | 'admin' | 'member';
  isActive: boolean;
  isMuted: boolean;
  mutedUntil?: Date;
  canSendMessages: boolean;
  canAddParticipants: boolean;
  canDeleteMessages: boolean;
  nickname?: string;
  joinedAt: Date;
  lastSeenAt?: Date;
  unreadCount: number;
  leftAt?: Date;
  invitedById?: string;
  invitedByName?: string;
}

export interface AddParticipantDto {
  userId: string;
  role?: 'admin' | 'member';
  nickname?: string;
}

export interface UpdateParticipantDto {
  role?: 'owner' | 'admin' | 'member';
  canSendMessages?: boolean;
  canAddParticipants?: boolean;
  canDeleteMessages?: boolean;
  nickname?: string;
  isMuted?: boolean;
  mutedUntil?: Date;
}

export interface MessageReactionDto {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: string;
  messageId: string;
  createdAt: Date;
}

export interface CreateMessageReactionDto {
  messageId: string;
  type: string;
}

export interface ChatQueryDto {
  page?: number;
  limit?: number;
  type?: ConversationType;
  department?: string;
  search?: string;
  unreadOnly?: boolean;
}

export interface MessageQueryDto {
  limit?: number;
  before?: string;
  after?: string;
  search?: string;
  type?: MessageType;
  pinnedOnly?: boolean;
}

export interface ChatAnalyticsDto {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  dailyMessages: number;
  weeklyMessages: number;
  monthlyMessages: number;
  conversationsByType: { type: ConversationType; count: number }[];
  conversationsByDepartment: { department: string; count: number }[];
  topActiveConversations: {
    id: string;
    name: string;
    messagesCount: number;
    participantsCount: number;
    lastActivity: Date;
  }[];
  topActiveUsers: {
    id: string;
    name: string;
    messagesCount: number;
    conversationsCount: number;
  }[];
  messageTypeStats: { type: MessageType; count: number; percentage: number }[];
  averageResponseTime: number;
  averageConversationDuration: number;
}

// ============================================
// TYPES POUR SOCIAL (POSTS, COMMENTS, REACTIONS)
// ============================================

// types/social.ts

export enum ContentType {
  POST = 'post',           // Correction: minuscules
  COMMENT = 'comment',     // Correction: minuscules
  MESSAGE = 'message',     // Correction: minuscules
  EVENT = 'event',         // Correction: minuscules
  JOB = 'job'              // Correction: minuscules
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CELEBRATE = 'celebrate',
  SUPPORT = 'support',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum Department {
  ASSURANCE = 'Assurance',
  CONSULTING = 'Consulting', 
  STRATEGY_AND_TRANSACTIONS = 'StrategyAndTransactions',
  TAX = 'Tax'
}
export interface CreatePostDto {
  content: string;
  images?: string[];
  files?: string[];
  tags?: string[];
  mentions?: string[];
  isPublic?: boolean;
  departmentOnly?: boolean;
  allowComments?: boolean;
  allowShares?: boolean;
  originalPostId?: string;
}

export interface UpdatePostDto {
  content?: string;
  tags?: string[];
  isPublic?: boolean;
  departmentOnly?: boolean;
  allowComments?: boolean;
  allowShares?: boolean;
}

export interface SharePostDto {
  originalPostId: string;
  comment?: string;
  isPublic?: boolean;
  departmentOnly?: boolean;
}

export interface CommentDto {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorProfilePicture?: string;
  authorDepartment: Department;
  postId: string;
  parentCommentId?: string;
  mentions?: string[];
  attachments?: string[];
  isEdited: boolean;
  likesCount: number;
  repliesCount: number;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // UI specific
  isLiked?: boolean;
  userReaction?: ReactionType;
  canEdit?: boolean;
  canDelete?: boolean;
  canFlag?: boolean;
  replies?: CommentDto[];
}

export interface CreateCommentDto {
  postId: string;
  content: string;
  parentCommentId?: string;
  mentions?: string[];
  attachments?: string[];
}

export interface UpdateCommentDto {
  content?: string;
  mentions?: string[];
  attachments?: string[];
}

export interface ReactionDto {
  id: string;
  type: ReactionType;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  userDepartment: Department;
  targetId: string;
  targetType: ContentType;
  createdAt: Date;
}

export interface CreateReactionDto {
  type: ReactionType;
  targetId: string;
  targetType: ContentType;
}


export interface FeedResponseDto {
  posts: PostDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchQueryDto {
  query: string;
  type?: 'posts' | 'users' | 'all';
  department?: Department;
  page?: number;
  limit?: number;
}

export interface SearchResultDto {
  posts?: PostDto[];
  users?: UserSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSearchResult {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  department: Department;
  fonction: string;
  isFollowing?: boolean;
  mutualConnections?: number;
}

export interface FlagContentDto {
  // Aliases pour compatibilité
  targetId: string;
  targetType: ContentType;
  reason: string;
  description?: string;


}

// ============================================
// TYPES POUR FOLLOWS
// ============================================
export interface FollowersResponse {
  followers: FollowDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FollowingResponse {
  following: FollowDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Réponse pour isFollowing
export interface IsFollowingResponse {
  isFollowing: boolean;
}

// Réponse pour unfollow
export interface UnfollowResponse {
  success: boolean;
  message: string
}
export interface FollowDto {
  id: string;
  followerId: string;
  followerName: string;
  followerProfilePicture?: string;
  followerDepartment: Department;
  followedId: string;
  followedName: string;
  followedProfilePicture?: string;
  followedDepartment: Department;
  isActive: boolean;
  createdAt: Date;
  unfollowedAt?: Date;
}

export interface CreateFollowDto {
  followedId: string;
}

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export interface MutualConnectionDto extends FollowDto {
  mutualFollowersCount?: number;
  commonInterests?: string[];
}

// ============================================
// TYPES POUR ADMIN
// ============================================

// types/admin.types.ts
export interface DashboardOverview {
  totalFlags: number;
  pendingFlags: number;
  underReviewFlags: number;
  resolvedFlags: number;
  urgentFlags: number;
  resolutionRate: number;
}

export interface ContentTypeStats {
  type: string;
  count: number;
}

export interface ReasonStats {
  reason: string;
  count: number;
}

export interface ModeratorStats {
  moderatorId: string;
  moderatorName: string;
  actionCount: number; // OU action_count selon la correction SQL choisie
  avgResolutionTime: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  byType: ContentTypeStats[];
  topReasons: ReasonStats[];
  resolutionStats: any[];
  moderatorStats: ModeratorStats[];
}

export interface FlaggedContentItem {
  id: string;
  status: string;
  targetType: string;
  reason: string;
  isUrgent: boolean;
  createdAt: string;
  contentAuthor: {
    fullName: string;
  };
  contentAuthorDepartment: string;
  reportedBy: {
    fullName: string;
  };
  reportCount: number;
}


export interface FlaggedContent {
  flags: Array<any>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerationActionDto {
  targetId: string;
  targetType: string;
  action: string;
  reason?: string;
  notifyUser?: boolean;
  banUser?: boolean;
  banDuration?: number;
}

export interface UserSearchQueryDto {
  q?: string;
  department?: string;
  isActive?: boolean;
  hasWarnings?: boolean;
  page?: number;
  limit?: number;
}

export interface ContentSearchQueryDto {
  q?: string;
  type?: string;
  authorId?: string;
  department?: string;
  isFlagged?: boolean;
  page?: number;
  limit?: number;
}

export interface FlagStatsQueryDto {
  startDate?: Date;
  endDate?: Date;
  department?: string;
  range?: string;
}
// ============================================
// TYPES POUR PROFILE
// ============================================
export interface SystemSettings {
  general: {
    maintenance: boolean;
    registrationEnabled: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  social: {
    maxPostLength: number;
    maxCommentLength: number;
    allowPublicPosts: boolean;
    moderationEnabled: boolean;
  };
  chat: {
    maxMessageLength: number;
    allowFileSharing: boolean;
    allowVoiceCalls: boolean;
    maxConversationParticipants: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    defaultPreferences: {
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
  };
}

export interface SystemLogs {
  logs: {
    id: string;
    level: 'error' | 'warn' | 'info' | 'debug';
    service: string;
    message: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }[];
  total: number;
  page: number;
  limit: number;
  filters: {
    level?: string;
    service?: string;
  };
}

export interface AuditLogs {
  auditLogs: {
    id: string;
    action: string;
    userId: string;
    userName: string;
    targetId?: string;
    targetType?: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  filters: {
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  };
}export interface BookmarkDto {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  post?: PostDto;
}

export interface BookmarkedPostsResponseDto {
  posts: PostDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookmarkStatusDto {
  isBookmarked: boolean;
}

export interface PostStatsDto {
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface ShareUrlDto {
  success: boolean;
  shareUrl: string;
  post: {
    title: string;
    description: string;
    image?: string | null;
  };
}

// Amélioration du FeedQueryDto pour supporter tous les filtres
export interface FeedQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  followingOnly?: boolean;
  departmentOnly?: boolean;
  myDepartment?: boolean;
  department?: Department | string;
  search?: string;
  tags?: string[];
  author?: string;
  hasImages?: boolean;
  hasFiles?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// Amélioration du TrendingDto pour supporter toutes les données
export interface TrendingDto {
  hashtags: HashtagTrendDto[];
  popularPosts: PostDto[];
  activeUsers: ActiveUserDto[];
  departmentStats: DepartmentStatDto[];
}

export interface HashtagTrendDto {
  tag: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  changeRate?: number;
}

export interface ActiveUserDto {
  id: string;
  fullName: string;
  department: string;
  profilePicture?: string | null;
  postsCount: number;
  engagementRate: number;
  followersCount?: number;
}

export interface DepartmentStatDto {
  department: string;
  postsCount: number;
  engagementRate: number;
  activeUsersCount: number;
  totalReactions: number;
}

// Types pour la recherche avancée
export interface AdvancedSearchOptionsDto {
  query?: string;
  author?: string;
  department?: Department | string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasImages?: boolean;
  hasFiles?: boolean;
  sortBy?: 'recent' | 'popular' | 'relevance';
  page?: number;
  limit?: number;
}

// Types pour les notifications
export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  targetId?: string;
  targetType?: 'post' | 'comment' | 'user';
  actionUrl?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Amélioration du PostDto pour supporter les posts partagés
export interface PostDto {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorProfilePicture?: string | null;
  authorDepartment: string;
  images?: string[] | null;
  files?: string[] | null;
  tags: string[];
  mentions: string[];
  isPublic: boolean;
  departmentOnly: boolean;
  allowComments: boolean;
  allowShares: boolean;
  isPinned: boolean;
  isEdited: boolean;
  originalPostId?: string | null;
  originalAuthorName?: string | null;
  originalPost?: PostDto; // Post original complet pour les partages
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  // Données relationnelles pour l'utilisateur actuel
  isLiked: boolean;
  userReaction?: ReactionType;
  isFollowingAuthor: boolean;
  isBookmarked?: boolean;
  // Permissions
  canEdit: boolean;
  canDelete: boolean;
  canFlag: boolean;
}

// Types pour les événements Kafka
export interface PostCreatedEvent {
  id: string;
  authorId: string;
  authorName: string;
  authorDepartment: string;
  content: string;
  isPublic: boolean;
  departmentOnly: boolean;
  mentions: string[];
  timestamp: Date;
}

export interface PostCommentedEvent {
  id: string;
  postId: string;
  postAuthorId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: string[];
  timestamp: Date;
}

export interface PostReactionEvent {
  id: string;
  postId: string;
  postAuthorId: string;
  userId: string;
  userName: string;
  reactionType: ReactionType;
  action: 'added' | 'removed' | 'updated';
  timestamp: Date;
}

// Types pour l'intégration avec .NET Core
export interface SocialActivityDto {
  userId: string;
  activityType: 'POST_CREATED' | 'POST_LIKED' | 'POST_COMMENTED' | 'POST_SHARED' | 'USER_FOLLOWED';
  targetId: string;
  details: Record<string, any>;
  timestamp?: Date;
}

// Types pour les analytics
export interface UserAnalyticsDto {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  postsCount: number;
  reactionsReceived: number;
  commentsReceived: number;
  sharesReceived: number;
  engagementRate: number;
  topTags: string[];
  mostEngagingPost?: string;
}

export interface DepartmentAnalyticsDto {
  department: string;
  period: 'day' | 'week' | 'month' | 'year';
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
  averageEngagementRate: number;
  topTags: string[];
  topUsers: {
    userId: string;
    userName: string;
    postsCount: number;
    engagementRate: number;
  }[];
}

// Types pour les erreurs de validation
export interface ValidationErrorDto {
  field: string;
  message: string;
  value?: any;
}

export interface ApiErrorResponseDto {
  success: false;
  message: string;
  errors?: ValidationErrorDto[];
  code?: string;
  timestamp: string;
}

export interface ApiSuccessResponseDto<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Types pour les webhooks
export interface WebhookPayloadDto {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  signature: string;
}

// Types pour les permissions avancées
export interface ContentPermissionDto {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canReact: boolean;
  canShare: boolean;
  canFlag: boolean;
  canPin: boolean;
  canModerate: boolean;
  reason?: string;
}

export interface ContentReportDto {
  id: string;
  contentId: string;
  contentType: ContentType;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewerId?: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
}


// Enums pour le frontend
export enum FlagStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum FlagAction {
  NO_ACTION = 'no_action',
  WARNING_SENT = 'warning_sent',
  CONTENT_HIDDEN = 'content_hidden',
  CONTENT_REMOVED = 'content_removed',
  USER_SUSPENDED = 'user_suspended',
  USER_BANNED = 'user_banned',
}

// Types pour les filtres
export interface FlagFilters {
  status?: FlagStatus;
  targetType?: ContentType;
  isUrgent?: boolean;
  page?: number;
  limit?: number;
}

export interface ProcessFlagActionDto {
  status: FlagStatus;
  actionTaken?: FlagAction;
  moderatorNotes?: string;
}

// Types pour les statistiques de modération
export interface ModerationStatsDto {
  totalFlags: number;
  pendingFlags: number;
  urgentFlags: number;
  resolvedToday: number;
  flagsByType: {
    [key in ContentType]: number;
  };
  flagsByReason: {
    [reason: string]: number;
  };
  averageResolutionTime: number; // en heures
}

// Type pour l'historique de modération
export interface ModerationHistoryDto {
  flagId: string;
  action: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: Date;
  notes?: string;
  previousStatus?: FlagStatus;
  newStatus: FlagStatus;
}