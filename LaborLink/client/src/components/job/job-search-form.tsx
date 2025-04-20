import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ServiceType } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobSearchFormProps = {
  onSearch: (filters: { jobType: string; location: string; skills: string; serviceType: string }) => void;
};

export default function JobSearchForm({ onSearch }: JobSearchFormProps) {
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [serviceType, setServiceType] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ jobType, location, skills, serviceType });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 mb-1">
          Job Type
        </label>
        <Input
          id="job-type"
          name="job-type"
          placeholder="E.g. Full-time, Contract"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="service-type" className="block text-sm font-medium text-gray-700 mb-1">
          Service Type
        </label>
        <Select onValueChange={setServiceType} value={serviceType}>
          <SelectTrigger id="service-type">
            <SelectValue placeholder="Any service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any service</SelectItem>
            <SelectItem value={ServiceType.ELECTRICIAN}>Electrician</SelectItem>
            <SelectItem value={ServiceType.PLUMBER}>Plumber</SelectItem>
            <SelectItem value={ServiceType.CARPENTER}>Carpenter</SelectItem>
            <SelectItem value={ServiceType.PAINTER}>Painter</SelectItem>
            <SelectItem value={ServiceType.GENERAL}>General Labor</SelectItem>
            <SelectItem value={ServiceType.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <Input
          id="location"
          name="location"
          placeholder="E.g. Mumbai, Delhi, Remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
          Skills
        </label>
        <Input
          id="skills"
          name="skills"
          placeholder="E.g. Wiring, Plumbing"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>
      
      <div className="flex items-end">
        <Button type="submit" className="w-full h-10">
          <Search className="mr-2 h-4 w-4" />
          Search Jobs
        </Button>
      </div>
    </form>
  );
}
