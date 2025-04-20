import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import JobCard from "@/components/job/job-card";
import JobSearchForm from "@/components/job/job-search-form";
import { useQuery } from "@tanstack/react-query";
import { Job, JobStatus } from "@shared/schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FindJobs() {
  const [filters, setFilters] = useState({
    jobType: "",
    location: "",
    skills: "",
    serviceType: "",
  });
  
  const [sortBy, setSortBy] = useState("recent");
  
  // Get jobs
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Handle search form submission
  const handleSearch = (searchFilters: { jobType: string; location: string; skills: string; serviceType: string }) => {
    setFilters(searchFilters);
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    ?.filter(job => {
      // Only show open jobs
      if (job.status !== JobStatus.OPEN) return false;
      
      // Filter by job type
      if (filters.jobType && !job.jobType.toLowerCase().includes(filters.jobType.toLowerCase())) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by skills
      if (filters.skills) {
        const skillsArray = filters.skills.toLowerCase().split(',').map(s => s.trim());
        if (skillsArray.length > 0 && skillsArray[0] !== '') {
          const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
          if (!skillsArray.some(skill => jobSkills.includes(skill))) {
            return false;
          }
        }
      }
      
      // Filter by service type
      if (filters.serviceType && filters.serviceType !== 'any') {
        // Check if the job has serviceType property and match
        if (!('serviceType' in job) || job.serviceType !== filters.serviceType) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortBy === "recent") {
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date();
        const aDate = a.createdAt ? new Date(a.createdAt) : new Date();
        return bDate.getTime() - aDate.getTime();
      }
      
      // If rate is a range like "$30-45/hr", extract the higher number for sorting
      const getRateNumber = (rate: string) => {
        const matches = rate.match(/\$(\d+)(-(\d+))?/);
        if (matches && matches[3]) {
          return parseInt(matches[3]);
        } else if (matches && matches[1]) {
          return parseInt(matches[1]);
        }
        return 0;
      };
      
      if (sortBy === "highest-pay") {
        return getRateNumber(b.rate) - getRateNumber(a.rate);
      }
      
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4 text-center md:text-left">Find the Perfect Job</h1>
          <p className="text-xl mb-6 text-center md:text-left">Browse job opportunities that match your skills and experience</p>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <JobSearchForm onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredJobs ? `${filteredJobs.length} jobs found` : 'Loading jobs...'}
          </p>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest-pay">Highest Paying</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters to find more job opportunities
            </p>
            <Button onClick={() => setFilters({ jobType: "", location: "", skills: "", serviceType: "" })}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
