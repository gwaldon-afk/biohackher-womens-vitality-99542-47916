import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpertDirectory } from "@/hooks/useExpertDirectory";
import { SPECIALTIES } from "@/types/experts";
import { Search, MapPin, Star, Award, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExpertDirectory() {
  const navigate = useNavigate();
  const { experts, loading, filters, setFilters } = useExpertDirectory();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    setFilters({ ...filters, location: searchTerm });
  };

  const filteredExperts = experts.filter((expert) => {
    if (searchTerm && !expert.location?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !expert.practice_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container py-8 space-y-6">
      {/* Hero Section - User Focused */}
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Your Trusted Health Partner
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with verified experts specializing in women's longevity and preventive health
          </p>
        </div>
        
        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
          <div className="p-4 rounded-lg bg-card border">
            <div className="font-semibold mb-1">🔬 Science-Backed</div>
            <p className="text-sm text-muted-foreground">Evidence-based approaches to longevity</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="font-semibold mb-1">✓ Verified Credentials</div>
            <p className="text-sm text-muted-foreground">All experts thoroughly vetted</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="font-semibold mb-1">💡 Personalized Care</div>
            <p className="text-sm text-muted-foreground">Tailored to your unique needs</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by location or practice name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={filters.specialty || ''}
              onValueChange={(value) => setFilters({ ...filters, specialty: value || undefined })}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Specialties</SelectItem>
                {SPECIALTIES.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.minRating?.toString() || ''}
              onValueChange={(value) => setFilters({ ...filters, minRating: value ? parseFloat(value) : undefined })}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading experts...</p>
        </div>
      ) : filteredExperts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No experts found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFilters({});
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert) => (
            <Card 
              key={expert.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${expert.featured ? 'border-primary' : ''}`}
              onClick={() => navigate(`/expert/${expert.id}`)}
            >
              {expert.featured && (
                <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1">
                  <Award className="h-3 w-3 inline mr-1" />
                  Featured Partner
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{expert.practice_name || 'Health Practice'}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {expert.location || expert.city ? `${expert.city || ''}, ${expert.state_province || ''}`.trim() : 'Location not specified'}
                    </CardDescription>
                  </div>
                  {expert.total_reviews > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {expert.average_rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {expert.bio || 'No bio provided'}
                </p>

                {expert.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {expert.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{expert.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Consultation Types */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {expert.offers_in_person && <span>• In-person</span>}
                  {expert.offers_virtual_video && <span>• Video</span>}
                  {expert.offers_virtual_phone && <span>• Phone</span>}
                  {expert.offers_virtual_messaging && <span>• Messaging</span>}
                </div>

                {expert.consultation_fee && (
                  <p className="text-sm font-medium">
                    From ${expert.consultation_fee}
                  </p>
                )}

                <Button variant="outline" className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/expert/${expert.id}`);
                }}>
                  View Profile
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Secondary CTA for Experts */}
      <Card className="mt-12 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Are You a Health Professional?</h2>
            <p className="text-muted-foreground">
              Join our network of verified experts and connect with clients seeking your expertise. 
              Earn referral commissions and grow your practice.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div>📊 Track your referrals</div>
              <div>💰 Earn up to 30% commission</div>
              <div>🎯 Featured placement options</div>
            </div>
            <Button 
              onClick={() => navigate('/expert/register')}
              size="lg"
              className="mt-4"
            >
              Register as an Expert Partner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}