import Backendless from 'backendless';

// Initialize Backendless
Backendless.initApp(
  import.meta.env.VITE_BACKENDLESS_APP_ID,
  import.meta.env.VITE_BACKENDLESS_API_KEY
);

export interface Certificate {
  objectId?: string;
  internName: string;
  internEmail: string;
  internPhone: string;
  courseName: string;
  courseCategory: string;
  issueDate: string;
  expiryDate: string;
  status: 'issued' | 'pending' | 'revoked' | 'expired';
  certificateId: string;
  completionScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'F';
  instructor: string;
  department: string;
  verificationCode: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  documentUrl?: string;
  created?: Date;
  updated?: Date;
}

class CertificateService {
  private tableName = 'Certificates';

  async getAllCertificates(): Promise<Certificate[]> {
    try {
      return await Backendless.Data.of(this.tableName).find();
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      const uploadedFile = await Backendless.Files.upload(file, `certificates/${fileName}`);
      return uploadedFile.fileURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createCertificate(certificate: Omit<Certificate, 'objectId'>, file?: File): Promise<Certificate> {
    try {
      let documentUrl = '';
      if (file) {
        const fileName = `${certificate.certificateId}_${file.name}`;
        documentUrl = await this.uploadFile(file, fileName);
      }
      
      const certificateData = { ...certificate, documentUrl };
      const result = await Backendless.Data.of(this.tableName).save(certificateData);
      
      // Create notification
      try {
        const notificationService = new NotificationService();
        await notificationService.addNotification(
          'success',
          'Certificate Created',
          `Certificate for ${certificate.internName} in ${certificate.courseName}`,
          'certificate',
          result.objectId
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  async updateCertificate(certificate: Certificate): Promise<Certificate> {
    try {
      return await Backendless.Data.of(this.tableName).save(certificate);
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }

  async deleteCertificate(objectId: string): Promise<void> {
    try {
      await Backendless.Data.of(this.tableName).remove({ objectId });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  }
}

export interface Intern {
  objectId?: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'paused';
  progress: number;
  avatar?: string;
  location: string;
  supervisor: string;
  tasksCompleted: number;
  totalTasks: number;
  rating: number;
  created?: Date;
  updated?: Date;
}

class InternService {
  private tableName = 'Interns';

  async getAllInterns(): Promise<Intern[]> {
    try {
      return await Backendless.Data.of(this.tableName).find();
    } catch (error) {
      console.error('Error fetching interns:', error);
      return [];
    }
  }

  async createIntern(intern: Omit<Intern, 'objectId'>): Promise<Intern> {
    try {
      const result = await Backendless.Data.of(this.tableName).save(intern);
      
      // Create notification
      try {
        const notificationService = new NotificationService();
        await notificationService.addNotification(
          'success',
          'New Intern Added',
          `${intern.name} has been added to ${intern.department}`,
          'intern',
          result.objectId
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating intern:', error);
      throw error;
    }
  }

  async updateIntern(intern: Intern): Promise<Intern> {
    try {
      return await Backendless.Data.of(this.tableName).save(intern);
    } catch (error) {
      console.error('Error updating intern:', error);
      throw error;
    }
  }

  async deleteIntern(objectId: string): Promise<void> {
    try {
      await Backendless.Data.of(this.tableName).remove({ objectId });
    } catch (error) {
      console.error('Error deleting intern:', error);
      throw error;
    }
  }
}

export interface Task {
  objectId?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedEmail: string;
  assignedPhone: string;
  assignedBy: string;
  department: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  attachmentUrls: string[];
  comments: Comment[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

class TaskService {
  private tableName = 'Tasks';

  async getAllTasks(): Promise<Task[]> {
    try {
      return await Backendless.Data.of(this.tableName).find();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async uploadTaskFiles(files: File[], taskId: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => {
        const fileName = `${taskId}_${file.name}`;
        return this.uploadFile(file, fileName);
      });
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading task files:', error);
      throw error;
    }
  }

  async createTask(task: Omit<Task, 'objectId'>, files?: File[]): Promise<Task> {
    try {
      let attachmentUrls: string[] = [];
      if (files && files.length > 0) {
        const taskId = `task_${Date.now()}`;
        attachmentUrls = await this.uploadTaskFiles(files, taskId);
      }
      
      const taskData = { ...task, attachmentUrls };
      const result = await Backendless.Data.of(this.tableName).save(taskData);
      
      // Create notification
      try {
        const notificationService = new NotificationService();
        await notificationService.addNotification(
          'info',
          'New Task Created',
          `Task "${task.title}" assigned to ${task.assignedTo}`,
          'task',
          result.objectId
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<Task> {
    try {
      return await Backendless.Data.of(this.tableName).save(task);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(objectId: string): Promise<void> {
    try {
      await Backendless.Data.of(this.tableName).remove({ objectId });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

export interface SystemLog {
  objectId?: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  created?: Date;
}

export interface Notification {
  objectId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  entityType: 'task' | 'intern' | 'certificate' | 'system';
  entityId?: string;
  created?: Date;
}

class NotificationService {
  private tableName = 'Notifications';

  async getAllNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      const queryBuilder = Backendless.DataQueryBuilder.create()
        .setPageSize(limit)
        .setSortBy(['created DESC']);
      return await Backendless.Data.of(this.tableName).find(queryBuilder);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async createNotification(notification: Omit<Notification, 'objectId'>): Promise<Notification> {
    try {
      return await Backendless.Data.of(this.tableName).save(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(objectId: string): Promise<void> {
    try {
      await Backendless.Data.of(this.tableName).save({ objectId, read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatePromises = notifications
        .filter(n => !n.read)
        .map(n => this.markAsRead(n.objectId!));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async addNotification(type: 'info' | 'success' | 'warning' | 'error', title: string, message: string, entityType: 'task' | 'intern' | 'certificate' | 'system', entityId?: string): Promise<void> {
    try {
      await this.createNotification({
        title,
        message,
        type,
        entityType,
        entityId,
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  }
}

class SystemLogService {
  private tableName = 'SystemLogs';

  async getAllLogs(limit: number = 50): Promise<SystemLog[]> {
    try {
      const queryBuilder = Backendless.DataQueryBuilder.create()
        .setPageSize(limit)
        .setSortBy(['created DESC']);
      const logs = await Backendless.Data.of(this.tableName).find(queryBuilder);
      
      // If no logs exist, create some initial logs
      if (logs.length === 0) {
        await this.createInitialLogs();
        return await Backendless.Data.of(this.tableName).find(queryBuilder);
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw error;
    }
  }

  async createLog(log: Omit<SystemLog, 'objectId'>): Promise<SystemLog> {
    try {
      return await Backendless.Data.of(this.tableName).save(log);
    } catch (error) {
      console.error('Error creating system log:', error);
      throw error;
    }
  }

  async addSystemLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, source: string, details?: string): Promise<void> {
    try {
      await this.createLog({
        timestamp: new Date().toISOString(),
        level,
        message,
        source,
        details
      });
    } catch (error) {
      console.error('Failed to add system log:', error);
    }
  }

  private async createInitialLogs(): Promise<void> {
    const now = new Date();
    const initialLogs = [
      {
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        level: 'INFO' as const,
        message: 'Daily backup completed successfully',
        source: 'BackupService',
        details: 'Backup size: 2.3GB, Duration: 45 minutes'
      },
      {
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        level: 'WARN' as const,
        message: `High memory usage detected: ${Math.floor(Math.random() * 20) + 70}%`,
        source: 'SystemMonitor',
        details: 'Memory threshold exceeded, consider optimization'
      },
      {
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        level: 'INFO' as const,
        message: 'User authentication successful',
        source: 'AuthService',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        details: 'Login from dashboard'
      },
      {
        timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
        level: 'ERROR' as const,
        message: 'Failed to send notification email',
        source: 'EmailService',
        details: 'SMTP connection timeout after 30 seconds'
      }
    ];

    for (const log of initialLogs) {
      await Backendless.Data.of(this.tableName).save(log);
    }
  }
}

export const certificateService = new CertificateService();
export const internService = new InternService();
export const taskService = new TaskService();
export const systemLogService = new SystemLogService();
export const notificationService = new NotificationService();
export default Backendless;