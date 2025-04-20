import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { InsertJob, insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ServiceType } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the insertJobSchema to add more validation
const createJobSchema = insertJobSchema
  .extend({
    // Add more specific validations
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(30, "Description must be at least 30 characters"),
    location: z.string().min(2, "Location is required"),
    jobType: z.string().min(2, "Job type is required"),
    serviceType: z.string().min(2, "Service type is required"),
    rate: z.string().min(1, "Rate information is required"),
    skills: z.array(z.string()).optional(),
  })
  .omit({ employerId: true }); // This will be added on the server

type CreateJobFormValues = z.infer<typeof createJobSchema>;

export default function CreateJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // If user is not an employer, redirect
  if (user && user.userType !== "employer") {
    return <Redirect to="/" />;
  }

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      jobType: "",
      serviceType: "",
      rate: "",
      skills: [],
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: CreateJobFormValues) => {
      // Parse skills from comma-separated string in the skills input
      const skillsInput = document.getElementById("skills-input") as HTMLInputElement;
      const skillsArray = skillsInput.value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
        
      const jobData = {
        ...data,
        skills: skillsArray,
      };
      
      const response = await apiRequest("POST", "/api/jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Created",
        description: "Your job posting has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      navigate("/employer-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Job",
        description: error.message || "An error occurred while creating the job.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateJobFormValues) => {
    createJobMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Create a New Job Posting</h1>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide details about the job to help workers find your posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Experienced Carpenter Needed"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use a clear and specific title to attract the right candidates.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the job responsibilities, requirements, and any other relevant details..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be detailed about what the job entails and what you're looking for in a worker.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Mumbai, Maharashtra"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            City, state or remote if applicable.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Full-time, Part-time, Contract"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ServiceType.ELECTRICIAN}>Electrician</SelectItem>
                              <SelectItem value={ServiceType.PLUMBER}>Plumber</SelectItem>
                              <SelectItem value={ServiceType.CARPENTER}>Carpenter</SelectItem>
                              <SelectItem value={ServiceType.PAINTER}>Painter</SelectItem>
                              <SelectItem value={ServiceType.GENERAL}>General Labor</SelectItem>
                              <SelectItem value={ServiceType.OTHER}>Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the primary service category for this job
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. ₹500-600/hr or ₹15,000 fixed price"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormItem>
                      <FormLabel>Skills Required</FormLabel>
                      <FormControl>
                        <Input
                          id="skills-input"
                          placeholder="e.g. Electrical wiring, Plumbing, Carpentry"
                        />
                      </FormControl>
                      <FormDescription>
                        Separate skills with commas
                      </FormDescription>
                    </FormItem>
                  </div>

                  <CardFooter className="px-0 pt-4 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate("/employer-dashboard")}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createJobMutation.isPending}
                    >
                      {createJobMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Job"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
