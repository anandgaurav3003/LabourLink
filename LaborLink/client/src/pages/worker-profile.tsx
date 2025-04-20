import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, MessageCircle, Star, User as UserIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { User, Review } from "@shared/schema";

export default function WorkerProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const { data: worker, isLoading } = useQuery<any>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${id}/reviews`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!worker || worker.userType !== "worker") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-center mb-4">Worker not found</h1>
              <p className="text-center text-gray-600">
                The worker profile you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex justify-center mt-6">
                <Link href="/find-workers">
                  <Button>Browse Workers</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {worker.avatar ? (
                      <img
                        src={worker.avatar}
                        alt={worker.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-2xl text-center sm:text-left">{worker.fullName}</CardTitle>
                    <CardDescription className="text-lg text-primary font-medium mt-1 text-center sm:text-left">
                      {worker.title || "Skilled Worker"}
                    </CardDescription>
                    {worker.rating ? (
                      <div className="flex items-center mt-2 justify-center sm:justify-start">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < worker.rating! ? "fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({worker.reviewCount} reviews)
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No reviews yet</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-700">
                      {worker.bio || "No information provided by the worker."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills && worker.skills.length > 0 ? (
                        worker.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No skills listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                    {isReviewsLoading ? (
                      <div className="py-4 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border p-4 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                                  {review.reviewer?.avatar ? (
                                    <img
                                      src={review.reviewer.avatar}
                                      alt={review.reviewer.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{review.reviewer?.fullName}</h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-3 text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No reviews yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worker.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{worker.location}</span>
                    </div>
                  )}
                  {worker.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{worker.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{worker.email}</span>
                  </div>

                  <Separator className="my-4" />

                  {currentUser ? (
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link href={`/messages/${worker.id}`}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Link>
                      </Button>
                      {worker.phone && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`tel:${worker.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`mailto:${worker.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/auth">Sign in to Contact</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 font-medium mb-2">Available for work</p>
                <p className="text-gray-700 text-sm">
                  This worker is currently looking for new opportunities. Contact them to discuss your project requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
