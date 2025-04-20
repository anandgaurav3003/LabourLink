import { 
  users, 
  User, 
  InsertUser, 
  jobs, 
  Job, 
  InsertJob,
  applications,
  Application,
  InsertApplication,
  reviews,
  Review,
  InsertReview,
  messages,
  Message,
  InsertMessage,
  JobStatus,
  ApplicationStatus
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getWorkers(): Promise<User[]>;
  getTopRatedWorkers(limit: number): Promise<User[]>;

  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: Partial<Job>): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  getEmployerJobs(employerId: number): Promise<Job[]>;

  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplications(filters?: Partial<Application>): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  getWorkerApplications(workerId: number): Promise<Application[]>;
  getJobApplications(jobId: number): Promise<Application[]>;

  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviews(filters?: Partial<Review>): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getUserReviews(userId: number): Promise<Review[]>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessages(filters?: Partial<Message>): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined>;
  getUserConversations(userId: number): Promise<{ otherUser: User, lastMessage: Message }[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private reviewIdCounter: number;
  private messageIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
    this.reviewIdCounter = 1;
    this.messageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      rating: 0,
      reviewCount: 0,
      skills: insertUser.skills || [] 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getWorkers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === "worker"
    );
  }

  async getTopRatedWorkers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.userType === "worker")
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: Partial<Job>): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters) {
      jobs = jobs.filter(job => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'skills' && value && Array.isArray(value) && value.length > 0) {
            return job.skills?.some(skill => value.includes(skill));
          }
          // @ts-ignore
          return !value || job[key] === value;
        });
      });
    }
    
    return jobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const now = new Date();
    const job: Job = { 
      ...insertJob, 
      id, 
      status: JobStatus.OPEN,
      createdAt: now,
      skills: insertJob.skills || []
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async getEmployerJobs(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.employerId === employerId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplications(filters?: Partial<Application>): Promise<Application[]> {
    let applications = Array.from(this.applications.values());
    
    if (filters) {
      applications = applications.filter(app => {
        return Object.entries(filters).every(([key, value]) => {
          // @ts-ignore
          return !value || app[key] === value;
        });
      });
    }
    
    return applications.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const application: Application = { 
      ...insertApplication, 
      id, 
      status: ApplicationStatus.PENDING,
      createdAt: now 
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getWorkerApplications(workerId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.workerId === workerId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getJobApplications(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId);
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviews(filters?: Partial<Review>): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());
    
    if (filters) {
      reviews = reviews.filter(review => {
        return Object.entries(filters).every(([key, value]) => {
          // @ts-ignore
          return !value || review[key] === value;
        });
      });
    }
    
    return reviews.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    
    // Update user rating
    const user = await this.getUser(review.toUserId);
    if (user) {
      const userReviews = await this.getUserReviews(user.id);
      const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = Math.round(totalRating / userReviews.length);
      
      await this.updateUser(user.id, { 
        rating: newRating,
        reviewCount: userReviews.length
      });
    }
    
    return review;
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.toUserId === userId);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessages(filters?: Partial<Message>): Promise<Message[]> {
    let messages = Array.from(this.messages.values());
    
    if (filters) {
      messages = messages.filter(message => {
        return Object.entries(filters).every(([key, value]) => {
          // @ts-ignore
          return !value || message[key] === value;
        });
      });
    }
    
    return messages.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      read: false,
      createdAt: now 
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getUserConversations(userId: number): Promise<{ otherUser: User, lastMessage: Message }[]> {
    // Get all messages that involve this user
    const userMessages = Array.from(this.messages.values())
      .filter(msg => msg.fromUserId === userId || msg.toUserId === userId);
    
    // Get unique user IDs that user has exchanged messages with
    const conversationUserIds = new Set<number>();
    userMessages.forEach(msg => {
      if (msg.fromUserId === userId) {
        conversationUserIds.add(msg.toUserId);
      } else if (msg.toUserId === userId) {
        conversationUserIds.add(msg.fromUserId);
      }
    });
    
    // For each user, get the last message
    const result: { otherUser: User, lastMessage: Message }[] = [];
    
    for (const otherUserId of conversationUserIds) {
      const otherUser = await this.getUser(otherUserId);
      if (!otherUser) continue;
      
      const conversation = userMessages
        .filter(msg => 
          (msg.fromUserId === userId && msg.toUserId === otherUserId) || 
          (msg.fromUserId === otherUserId && msg.toUserId === userId)
        )
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      
      if (conversation.length > 0) {
        result.push({
          otherUser,
          lastMessage: conversation[0]
        });
      }
    }
    
    // Sort by most recent message
    return result.sort((a, b) => {
      const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => 
        (msg.fromUserId === user1Id && msg.toUserId === user2Id) || 
        (msg.fromUserId === user2Id && msg.toUserId === user1Id)
      )
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }
}

export const storage = new MemStorage();
