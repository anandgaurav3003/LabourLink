import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { JobStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, DollarSign, Users, MessageCircle, Edit, Eye } from "lucide-react";
import { Link } from "wouter";

export default function EmployerDashboard() {
  const { user } = useAuth();

  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ["/api/employer/jobs"],
  });

  if (!user) return null;

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

  const countJobsByStatus = (status: string) => {
    return jobs?.filter((job: any) => job.status === status).length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employer Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and find skilled workers</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/create-job">
              <Button>Post a New Job</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Open</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {countJobsByStatus(JobStatus.OPEN)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {countJobsByStatus(JobStatus.IN_PROGRESS)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <Badge className="bg-green-100 text-green-800">
                    {countJobsByStatus(JobStatus.COMPLETED)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-gray-600 text-sm mt-1">{user.location || "Add your location"}</p>
                
                <Button variant="link" className="p-0 mt-4 h-auto">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/find-workers">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Find Workers
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link href="/create-job">
                  <Button className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Job Postings</h2>
          
          {isJobsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {jobs.map((job: any) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      statusClass={getStatusBadgeColor}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="open">
                <div className="space-y-4">
                  {jobs
                    .filter((job: any) => job.status === JobStatus.OPEN)
                    .map((job: any) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusClass={getStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="in-progress">
                <div className="space-y-4">
                  {jobs
                    .filter((job: any) => job.status === JobStatus.IN_PROGRESS)
                    .map((job: any) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusClass={getStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="space-y-4">
                  {jobs
                    .filter((job: any) => job.status === JobStatus.COMPLETED)
                    .map((job: any) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusClass={getStatusBadgeColor}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
              <Link href="/create-job">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function JobCard({ 
  job, 
  statusClass
}: { 
  job: any; 
  statusClass: (status: string) => string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <Badge className={statusClass(job.status)}>{job.status}</Badge>
            </div>
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
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills && job.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="mt-2 flex gap-2">
              <Link href={`/jobs/${job.id}/applications`}>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Applications
                </Button>
              </Link>
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
              {job.status === JobStatus.OPEN && (
                <Link href={`/jobs/${job.id}/edit`}>
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
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
