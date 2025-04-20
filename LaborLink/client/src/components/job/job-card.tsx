import { Link } from "wouter";
import { Job, JobStatus, ServiceType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Briefcase, Wrench } from "lucide-react";

type JobCardProps = {
  job: Job;
};

export default function JobCard({ job }: JobCardProps) {
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    
    const d = new Date(date);
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          <Badge className={getStatusBadgeColor(job.status)}>{job.status}</Badge>
        </div>
        
        <div className="flex items-center mt-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <Briefcase className="h-4 w-4 mr-1" />
          <span>{job.jobType}</span>
          
          {'serviceType' in job && (
            <>
              <span className="mx-2">•</span>
              <Wrench className="h-4 w-4 mr-1" />
              <span className="capitalize">{job.serviceType}</span>
            </>
          )}
          
          <span className="mx-2">•</span>
          
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDate(job.createdAt)}</span>
        </div>
        
        <div className="border-t border-gray-200 mt-4 pt-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.description}
          </p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills && job.skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <span className="font-semibold text-gray-800">{job.rate}</span>
          <Link href={`/jobs/${job.id}`}>
            <span className="text-primary font-medium text-sm hover:text-blue-700">View Details</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
