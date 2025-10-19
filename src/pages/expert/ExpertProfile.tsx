import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useExpertDirectory } from "@/hooks/useExpertDirectory";
import { useExpertServices } from "@/hooks/useExpertServices";
import { supabase } from "@/integrations/supabase/client";
import { ExpertProfile as ExpertProfileType, ExpertReview } from "@/types/experts";
import { MapPin, Phone, Globe, Star, Clock, DollarSign, Calendar, MessageCircle, Video, Users, Award, GraduationCap } from "lucide-react";

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

  const getInitials = () => {
    return expert.practice_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20">
        {expert.cover_photo_url && (
          <img 
            src={expert.cover_photo_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container pb-8">
        {/* Profile Header Card */}
        <Card className="relative -mt-20 border-primary/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Photo */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg -mt-16">
                <AvatarImage src={expert.profile_photo_url || undefined} alt={expert.practice_name} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>

              {/* Header Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{expert.practice_name}</h1>
                      {expert.featured && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    {expert.professional_tagline && (
                      <p className="text-lg text-muted-foreground italic mb-3">
                        "{expert.professional_tagline}"
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {expert.years_of_practice && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {expert.years_of_practice} years experience
                        </div>
                      )}
                      {expert.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {expert.city}, {expert.state_province}
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
                  </div>

                  <Button size="lg" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Book Consultation
                  </Button>
                </div>

                {/* Consultation Types */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.offers_in_person && (
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      In-person
                    </Badge>
                  )}
                  {expert.offers_virtual_video && (
                    <Badge variant="secondary" className="gap-1">
                      <Video className="h-3 w-3" />
                      Video call
                    </Badge>
                  )}
                  {expert.offers_virtual_phone && (
                    <Badge variant="secondary" className="gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </Badge>
                  )}
                  {expert.offers_virtual_messaging && (
                    <Badge variant="secondary" className="gap-1">
                      <MessageCircle className="h-3 w-3" />
                      Messaging
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {expert.total_reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{expert.average_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({expert.total_reviews} review{expert.total_reviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction Video */}
        {expert.intro_video_url && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Meet {expert.practice_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <video 
                src={expert.intro_video_url} 
                className="w-full max-w-3xl rounded-lg shadow-lg"
                controls
                poster={expert.profile_photo_url || undefined}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
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

            {/* Education */}
            {expert.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {expert.education}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {expert.certifications && expert.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {expert.certifications.map((cert, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
                <TabsTrigger value="availability" className="flex-1">Availability</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {expert.practice_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {expert.bio}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
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
                          <div key={service.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
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
                                <div className="flex items-center gap-1 font-bold text-primary">
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

              {/* Availability Tab */}
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
                            <div key={day} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50">
                              <div className="w-24 font-medium text-sm">{day}</div>
                              <div className="flex-1">
                                {slots.length === 0 ? (
                                  <span className="text-sm text-muted-foreground">Not available</span>
                                ) : (
                                  <div className="space-y-1">
                                    {slots.map((slot) => (
                                      <div key={slot.id} className="text-sm flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
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

              {/* Reviews Tab */}
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
                          <div key={review.id} className="p-4 rounded-lg border bg-card">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
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
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.review_text}</p>
                            )}
                            {review.response_text && (
                              <div className="mt-3 p-3 rounded bg-muted border-l-4 border-primary">
                                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  Expert Response:
                                </p>
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
        </div>
      </div>
    </div>
  );
}