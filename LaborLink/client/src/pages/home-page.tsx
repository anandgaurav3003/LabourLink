import HeroSection from "@/components/home/hero-section";
import JobSearchForm from "@/components/job/job-search-form";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import JobCard from "@/components/job/job-card";
import WorkerCard from "@/components/worker/worker-card";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import { Job, User } from "@shared/schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [jobFilters, setJobFilters] = useState({
    jobType: "",
    location: "",
    skills: "",
  });
  
  const { 
    data: jobs,
    isLoading: isJobsLoading,
  } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });
  
  const {
    data: topWorkers,
    isLoading: isWorkersLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/workers/top-rated"],
  });

  const handleSearch = (filters: { jobType: string; location: string; skills: string }) => {
    setJobFilters(filters);
    // We would typically use this to filter jobs, but for now we're just fetching all jobs
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <HeroSection />
      
      <div className="bg-white shadow-md -mt-6 rounded-lg mx-4 md:mx-auto max-w-5xl relative z-10">
        <JobSearchForm onSearch={handleSearch} />
      </div>
      
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Latest Job Opportunities</h2>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Sort by:</span>
            <select className="border border-gray-300 rounded-md p-2 text-sm">
              <option>Most Recent</option>
              <option>Highest Paying</option>
              <option>Nearest Location</option>
            </select>
          </div>
        </div>

        {isJobsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs?.slice(0, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <a href="/find-jobs" className="bg-white border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition duration-150">
                View All Jobs
              </a>
            </div>
          </>
        )}
      </section>
      
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Top Rated Workers</h2>
          
          {isWorkersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topWorkers?.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <a href="/find-workers" className="bg-white border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition duration-150">
                  Browse All Workers
                </a>
              </div>
            </>
          )}
        </div>
      </section>
      
      <HowItWorks />
      
      <Testimonials />
      
      <CTASection />
      
      <Footer />
    </div>
  );
}
