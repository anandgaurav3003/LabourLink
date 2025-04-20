import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationStatus, JobStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, DollarSign, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function WorkerDashboard() {
  const { user } = useAuth();

  const { data: applications, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["/api/worker/applications"],
  });

  if (!user) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ApplicationStatus.ACCEPTED:
        return "bg-green-100 text-green-800";
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getJobStatusBadgeColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
            <p className="text-gray-600">Manage your applications and find new opportunities</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/find-jobs">
              <Button>Find New Jobs</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">{user.fullName.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-primary text-sm mb-2">{user.title || "Add your title"}</p>
                {user.rating ? (
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${i < user.rating! ? "fill-current" : "text-gray-300"}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({user.reviewCount} reviews)
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">No reviews yet</p>
                )}
                
                <div className="w-full mt-4">
                  <Link href="/worker-profile/edit">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Add your skills to help employers find you</p>
              )}
              <Button variant="link" className="p-0 mt-4 h-auto">
                Update Skills
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="text-2xl font-semibold">{applications?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Accepted Applications</p>
                  <p className="text-2xl font-semibold">
                    {applications?.filter((a: any) => a.status === ApplicationStatus.ACCEPTED).length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                  <p className="text-2xl font-semibold">
                    {applications?.filter((a: any) => a.job?.status === JobStatus.COMPLETED).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
          
          {isApplicationsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications && applications.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {applications.map((application: any) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      statusClass={getStatusBadgeColor}
                      jobStatusClass={getJobStatusBadgeColor}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="space-y-4">
                  {applications
                    .filter((app: any) => app.status === ApplicationStatus.PENDING)
                    .map((application: any) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        statusClass={getStatusBadgeColor}
                        jobStatusClass={getJobStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="accepted">
                <div className="space-y-4">
                  {applications
                    .filter((app: any) => app.status === ApplicationStatus.ACCEPTED)
                    .map((application: any) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        statusClass={getStatusBadgeColor}
                        jobStatusClass={getJobStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="rejected">
                <div className="space-y-4">
                  {applications
                    .filter((app: any) => app.status === ApplicationStatus.REJECTED)
                    .map((application: any) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        statusClass={getStatusBadgeColor}
                        jobStatusClass={getJobStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
              <Link href="/find-jobs">
                <Button>Browse Available Jobs</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ApplicationCard({ 
  application, 
  statusClass, 
  jobStatusClass 
}: { 
  application: any; 
  statusClass: (status: string) => string;
  jobStatusClass: (status: string) => string;
}) {
  const job = application.job;
  
  if (!job) return null;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <Badge className={jobStatusClass(job.status)}>{job.status}</Badge>
            </div>
            <p className="text-gray-600 text-sm">{job.company}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.rate}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <Badge className={statusClass(application.status)}>
              {application.status}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Applied on {new Date(application.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-2 flex gap-2">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </Link>
              {application.status === ApplicationStatus.ACCEPTED && (
                <Link href={`/messages/${job.employerId}`}>
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
