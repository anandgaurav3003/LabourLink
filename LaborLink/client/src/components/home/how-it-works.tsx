import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserCircle, Search, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How SkillMatch Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Create Your Profile
            </h3>
            <p className="text-gray-600">
              Sign up and build your profile showcasing your skills, experience, and availability. Or register as an employer looking to hire skilled professionals.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Find the Perfect Match
            </h3>
            <p className="text-gray-600">
              Search for jobs or workers using filters for location, skills, and job type. Browse profiles, check ratings, and find the perfect match for your needs.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Complete the Job
            </h3>
            <p className="text-gray-600">
              Connect directly with workers or employers, communicate through our platform, complete the job, and leave reviews to build your reputation.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/auth">
            <Button className="bg-primary text-white px-8 py-4 h-auto rounded-md font-semibold hover:bg-blue-700 transition duration-150">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
