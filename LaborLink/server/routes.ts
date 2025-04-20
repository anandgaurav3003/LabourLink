import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertJobSchema, 
  insertApplicationSchema, 
  insertReviewSchema, 
  insertMessageSchema,
  JobStatus,
  ApplicationStatus
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: () => void) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Users routes
  app.get("/api/workers", async (req, res) => {
    try {
      const workers = await storage.getWorkers();
      // Don't send the password back to the client
      const workersWithoutPassword = workers.map(w => {
        const { password, ...userWithoutPassword } = w;
        return userWithoutPassword;
      });
      res.json(workersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/workers/top-rated", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const topWorkers = await storage.getTopRatedWorkers(limit);
      // Don't send the password back to the client
      const workersWithoutPassword = topWorkers.map(w => {
        const { password, ...userWithoutPassword } = w;
        return userWithoutPassword;
      });
      res.json(workersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password back to the client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Ensure users can only update their own profile
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prevent password update through this endpoint
      const { password, id, ...updates } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password back to the client
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.jobType) filters.jobType = req.query.jobType;
      if (req.query.location) filters.location = req.query.location;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.skills) {
        filters.skills = Array.isArray(req.query.skills) 
          ? req.query.skills 
          : [req.query.skills];
      }
      
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      // Validate that the user is an employer
      if (req.user?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can post jobs" });
      }
      
      const validatedData = insertJobSchema.parse({
        ...req.body,
        employerId: req.user.id
      });
      
      const newJob = await storage.createJob(validatedData);
      res.status(201).json(newJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.patch("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Ensure only the job creator can update it
      if (job.employerId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prevent changing employer
      const { id, employerId, createdAt, ...updates } = req.body;
      
      const updatedJob = await storage.updateJob(jobId, updates);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employer/jobs", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.userType !== "employer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const jobs = await storage.getEmployerJobs(req.user.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Applications routes
  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      // Validate that the user is a worker
      if (req.user?.userType !== "worker") {
        return res.status(403).json({ message: "Only workers can submit applications" });
      }
      
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        workerId: req.user.id
      });
      
      // Check if job exists
      const job = await storage.getJob(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if job is open
      if (job.status !== JobStatus.OPEN) {
        return res.status(400).json({ message: "This job is not accepting applications" });
      }
      
      // Check if worker already applied
      const existingApplications = await storage.getApplications({
        jobId: validatedData.jobId,
        workerId: req.user.id
      });
      
      if (existingApplications.length > 0) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      
      const newApplication = await storage.createApplication(validatedData);
      res.status(201).json(newApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/worker/applications", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.userType !== "worker") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const applications = await storage.getWorkerApplications(req.user.id);
      
      // Include job details with each application
      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          return { ...app, job };
        })
      );
      
      res.json(applicationsWithJobs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/jobs/:id/applications", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Ensure only the job creator can view applications
      if (job.employerId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const applications = await storage.getJobApplications(jobId);
      
      // Include worker details with each application
      const applicationsWithWorkers = await Promise.all(
        applications.map(async (app) => {
          const worker = await storage.getUser(app.workerId);
          const { password, ...workerWithoutPassword } = worker || {};
          return { ...app, worker: workerWithoutPassword };
        })
      );
      
      res.json(applicationsWithWorkers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const job = await storage.getJob(application.jobId);
      
      // Ensure only the employer can update application status
      if (job?.employerId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { status } = req.body;
      
      // Only allow valid status values
      if (status && !Object.values(ApplicationStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      
      // If application is accepted, update job status if it's the first accepted application
      if (status === ApplicationStatus.ACCEPTED && job?.status === JobStatus.OPEN) {
        await storage.updateJob(job.id, { status: JobStatus.IN_PROGRESS });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        fromUserId: req.user?.id
      });
      
      // Check if job exists and is completed
      const job = await storage.getJob(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.status !== JobStatus.COMPLETED) {
        return res.status(400).json({ message: "Can only review completed jobs" });
      }
      
      // Check if user is associated with this job
      if (job.employerId !== req.user?.id && validatedData.toUserId !== job.employerId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if already reviewed
      const existingReviews = await storage.getReviews({
        jobId: validatedData.jobId,
        fromUserId: req.user?.id,
        toUserId: validatedData.toUserId
      });
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ message: "You have already reviewed this user for this job" });
      }
      
      const newReview = await storage.createReview(validatedData);
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reviews = await storage.getUserReviews(userId);
      
      // Include reviewer details with each review
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.fromUserId);
          const { password, ...reviewerWithoutPassword } = reviewer || {};
          return { ...review, reviewer: reviewerWithoutPassword };
        })
      );
      
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Messages routes
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: req.user?.id
      });
      
      // Check if recipient exists
      const recipient = await storage.getUser(validatedData.toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      const newMessage = await storage.createMessage(validatedData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user?.id || 0);
      
      // Don't send passwords
      const sanitizedConversations = conversations.map(conv => {
        const { password, ...otherUserWithoutPassword } = conv.otherUser;
        return {
          ...conv,
          otherUser: otherUserWithoutPassword
        };
      });
      
      res.json(sanitizedConversations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      
      // Check if other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messages = await storage.getConversation(req.user?.id || 0, otherUserId);
      
      // Mark messages as read
      await Promise.all(
        messages
          .filter(msg => msg.toUserId === req.user?.id && !msg.read)
          .map(msg => storage.updateMessage(msg.id, { read: true }))
      );
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
