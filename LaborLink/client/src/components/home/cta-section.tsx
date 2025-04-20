import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join thousands of workers and employers already using SkillMatch to connect, collaborate, and complete jobs with confidence.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {user ? (
            <>
              {user.userType === UserType.EMPLOYER ? (
                <>
                  <Link href="/find-workers">
                    <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                      Find Workers
                    </Button>
                  </Link>
                  <Link href="/create-job">
                    <Button className="bg-secondary text-white hover:bg-green-600 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                      Post a Job
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/find-jobs">
                    <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                      Find Jobs
                    </Button>
                  </Link>
                  <Link href="/worker-dashboard">
                    <Button className="bg-secondary text-white hover:bg-green-600 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                      Update Profile
                    </Button>
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/auth?tab=register&type=employer">
                <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                  Find Workers
                </Button>
              </Link>
              <Link href="/auth?tab=register&type=worker">
                <Button className="bg-secondary text-white hover:bg-green-600 px-8 py-3 h-auto rounded-md font-semibold min-w-[200px]">
                  Find Jobs
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
