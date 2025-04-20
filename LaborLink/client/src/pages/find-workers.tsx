import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WorkerCard from "@/components/worker/worker-card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export default function FindWorkers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const { data: workers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/workers"],
  });

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Get all unique skills from workers
  const allSkills: string[] = [];
  if (workers) {
    const skillsSet: Set<string> = new Set();
    workers.forEach(worker => {
      if (worker.skills) {
        worker.skills.forEach(skill => {
          skillsSet.add(skill);
        });
      }
    });
    allSkills.push(...Array.from(skillsSet));
  }

  // Filter workers based on search and selected skills
  const filteredWorkers = workers?.filter(worker => {
    const matchesSearch = searchTerm === '' || 
      worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => worker.skills?.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 text-center md:text-left">Find Workers</h1>
            <p className="text-gray-600 text-center md:text-left">Discover skilled professionals for your project</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Name, title or location"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allSkills.map((skill) => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                  
                  {allSkills.length === 0 && (
                    <p className="text-sm text-gray-500">No skills found</p>
                  )}
                </div>
              </div>
              
              {selectedSkills.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => setSelectedSkills([])}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredWorkers && filteredWorkers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No workers found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setSelectedSkills([]);
                }}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
