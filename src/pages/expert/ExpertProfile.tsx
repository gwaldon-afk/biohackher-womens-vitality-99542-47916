import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpertDirectory } from "@/hooks/useExpertDirectory";
import { useExpertServices } from "@/hooks/useExpertServices";
import { supabase } from "@/integrations/supabase/client";
import { ExpertProfile as ExpertProfileType, ExpertReview } from "@/types/experts";
import { MapPin, Phone, Globe, Star, Clock, DollarSign, Calendar, MessageCircle } from "lucide-react";

export default function ExpertProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExpertById } = useExpertDirectory();
  const [expert, setExpert] = useState<ExpertProfileType | null>(null);
  const [reviews, setReviews] = useState<ExpertReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { services, availability } = useExpertServices(id || null);

  useEffect(() => {
    if (id) {
      fetchExpert();
      fetchReviews();
    }
  }, [id]);

  const fetchExpert = async () => {
    if (!id) return;
    const data = await getExpertById(id);
    setExpert(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      const { data } = await supabase
        .from('expert_reviews')
        .select('*')
        .eq('expert_id', id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (loading) {
    return <div className="container py-8 text-center">Loading expert profile...</div>;
  }

  if (!expert) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Expert not found</p>
            <Button onClick={() => navigate('/experts')}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Hero Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{expert.practice_name}</h1>
                {expert.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {expert.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {expert.location}
                  </div>
                )}
                {expert.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {expert.phone}
                  </div>
                )}
                {expert.website && (
                  <a href={expert.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
              {expert.total_reviews > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{expert.average_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({expert.total_reviews} review{expert.total_reviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
            <Button size="lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              Book Consultation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{expert.bio}</p>
        </CardContent>
      </Card>

      {/* Specialties */}
      {expert.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>Professional services and consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services listed yet</p>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">{service.service_name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex gap-4 text-sm">
                        {service.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.duration_minutes} min
                          </div>
                        )}
                        {service.price && (
                          <div className="flex items-center gap-1 font-bold">
                            <DollarSign className="h-4 w-4" />
                            ${service.price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>When this expert is typically available</CardDescription>
            </CardHeader>
            <CardContent>
              {availability.length === 0 ? (
                <p className="text-sm text-muted-foreground">Availability not specified</p>
              ) : (
                <div className="space-y-3">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                    const slots = availability.filter(a => a.day_of_week === index);
                    return (
                      <div key={day} className="flex items-start gap-4">
                        <div className="w-24 font-medium text-sm">{day}</div>
                        <div className="flex-1">
                          {slots.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Not available</span>
                          ) : (
                            <div className="space-y-1">
                              {slots.map((slot) => (
                                <div key={slot.id} className="text-sm">
                                  {slot.start_time} - {slot.end_time}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Client Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {review.verified_purchase && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-muted-foreground mb-3">{review.review_text}</p>
                      )}
                      {review.response_text && (
                        <div className="mt-3 p-3 rounded bg-muted">
                          <p className="text-xs font-medium mb-1">Expert Response:</p>
                          <p className="text-sm">{review.response_text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}