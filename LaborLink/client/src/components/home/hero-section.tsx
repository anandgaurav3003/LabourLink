import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { UserType } from "@shared/schema";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-center md:text-left">
              Connect with the right talent for your job
            </h1>
            <p className="text-lg md:text-xl mb-8 text-center md:text-left">
              The easiest way to find skilled workers or jobs that match your expertise across India.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              {user ? (
                <>
                  {user.userType === UserType.EMPLOYER ? (
                    <>
                      <Link href="/find-workers">
                        <Button className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                          Find Workers
                        </Button>
                      </Link>
                      <Link href="/employer-dashboard">
                        <Button className="bg-secondary text-white hover:bg-green-600 w-full sm:w-auto">
                          Your Dashboard
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/find-jobs">
                        <Button className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                          Find Jobs
                        </Button>
                      </Link>
                      <Link href="/worker-dashboard">
                        <Button className="bg-secondary text-white hover:bg-green-600 w-full sm:w-auto">
                          Your Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link href="/auth?tab=register&type=employer">
                    <Button className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                      I need workers
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register&type=worker">
                    <Button className="bg-secondary text-white hover:bg-green-600 w-full sm:w-auto">
                      I'm looking for work
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative rounded-lg shadow-xl overflow-hidden">
              <svg 
                className="w-full"
                viewBox="0 0 500 300" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="500" height="300" fill="#f0f4f8" />
                <g fill="#d1d8e0">
                  <circle cx="80" cy="80" r="40" />
                  <circle cx="420" cy="120" r="60" />
                  <circle cx="300" cy="250" r="40" />
                  <rect x="200" y="50" width="100" height="60" rx="10" />
                  <rect x="120" y="150" width="150" height="80" rx="10" />
                </g>
                <g fill="#a0aec0">
                  <rect x="250" y="150" width="120" height="20" rx="5" />
                  <rect x="250" y="180" width="80" height="20" rx="5" />
                  <rect x="250" y="210" width="100" height="20" rx="5" />
                </g>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-indigo-600/60 flex items-center justify-center text-white text-lg font-medium">
                Skilled workers collaborating on projects across India
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
