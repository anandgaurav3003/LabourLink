import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, DollarSign, MapPin, Briefcase, User, Mail, MessageCircle, Clock } from "lucide-react";
import { useState } from "react";
import { ApplicationStatus, JobStatus, UserType } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/${id}`],
  });

  const { data: employer } = useQuery({
    queryKey: [`/api/users/${job?.employerId}`],
    enabled: !!job?.employerId,
  });

  const { data: applications } = useQuery({
    queryKey: [`/api/worker/applications`],
    enabled: !!user && user.userType === UserType.WORKER,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { jobId: number; coverLetter: string }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return await res.json();
    },
    onSuccess: () => {
      setIsApplyDialogOpen(false);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["/api/worker/applications"] });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-center mb-4">Job not found</h1>
              <p className="text-center text-gray-600">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex justify-center mt-6">
                <Link href="/find-jobs">
                  <Button>Browse Available Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const hasApplied = applications?.some((app: any) => app.jobId === parseInt(id));
  const isJobCreator = user?.id === job.employerId;
  const canApply = !isJobCreator && user?.userType === UserType.WORKER && !hasApplied && job.status === JobStatus.OPEN;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case JobStatus.OPEN:
        return "bg-blue-100 text-blue-800";
      case JobStatus.IN_PROGRESS:
        return "bg-purple-100 text-purple-800";
      case JobStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApply = () => {
    applyMutation.mutate({
      jobId: parseInt(id),
      coverLetter,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2 flex flex-wrap gap-4">
                      <span className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.jobType}
                      </span>
                      <span className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.rate}
                      </span>
                      <span className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills && job.skills.length > 0 ? (
                        job.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No specific skills required</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" asChild>
                  <Link href="/find-jobs">Back to Jobs</Link>
                </Button>
                {canApply && (
                  <Button onClick={() => setIsApplyDialogOpen(true)}>
                    Apply Now
                  </Button>
                )}
                {hasApplied && (
                  <span className="text-green-600 font-medium">
                    You have already applied for this job
                  </span>
                )}
                {isJobCreator && (
                  <Button asChild>
                    <Link href={`/jobs/${id}/applications`}>View Applications</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            {employer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Employer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                      {employer.avatar ? (
                        <img
                          src={employer.avatar}
                          alt={employer.fullName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{employer.fullName}</h3>
                      <p className="text-sm text-gray-500">{employer.location || "Location not specified"}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4">
                    {employer.bio || "No information provided by the employer."}
                  </p>

                  <Separator className="my-4" />

                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/messages/${employer.id}`}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`mailto:${employer.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/auth">Sign in to Contact</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm mb-4">
                  Looking for similar opportunities? Check out these jobs.
                </p>
                <Link href="/find-jobs">
                  <Button variant="outline" className="w-full">Browse More Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this job. Include details about why you're a good fit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Cover Letter</h4>
              <Textarea
                placeholder="Introduce yourself and explain why you're a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleApply} 
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
