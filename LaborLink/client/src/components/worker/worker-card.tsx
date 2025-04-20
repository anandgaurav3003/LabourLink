import { Link } from "wouter";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

type WorkerCardProps = {
  worker: User;
};

export default function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition duration-200">
      <div className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={worker.avatar || ""} alt={worker.fullName} />
            <AvatarFallback className="text-lg">{worker.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            {worker.fullName}
          </h3>
          
          <p className="text-primary font-medium text-sm mb-2">
            {worker.title || "Skilled Worker"}
          </p>
          
          <div className="flex text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < (worker.rating || 0) ? "fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          
          <p className="text-sm text-center text-gray-600 mb-4 line-clamp-2">
            {worker.bio || "Professional with experience in various projects."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {worker.skills && worker.skills.length > 0 ? (
              worker.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">General Labor</Badge>
            )}
            
            {worker.skills && worker.skills.length > 3 && (
              <Badge variant="secondary">+{worker.skills.length - 3} more</Badge>
            )}
          </div>
          
          <Link href={`/workers/${worker.id}`}>
            <span className="text-primary font-medium text-sm hover:text-blue-700">
              View Profile
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
