import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Raj Sharma",
      role: "Homeowner",
      avatar: "",
      content: "I needed urgent plumbing repairs in my flat and couldn't find anyone available locally. SkillMatch connected me with Suresh within hours, and he fixed everything the same day. The platform made it easy to communicate and pay. Excellent service!",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Electrician",
      avatar: "",
      content: "Since joining SkillMatch, I've been able to find consistent work around Mumbai. The platform helps me manage my schedule, and clients can easily see my qualifications and reviews. I've increased my income by about 40% and now have a steady stream of projects.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Success Stories
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white p-8 rounded-lg shadow">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="flex text-amber-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
