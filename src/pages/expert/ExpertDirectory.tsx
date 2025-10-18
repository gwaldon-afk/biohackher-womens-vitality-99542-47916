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
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">Find Your Expert Partner</h1>
        <p className="text-muted-foreground text-lg">
          Connect with verified health professionals specializing in women's longevity
        </p>
        
        {/* CTA for Experts */}
        <Card className="max-w-2xl mx-auto border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1">Are you a health professional?</h3>
                <p className="text-sm text-muted-foreground">
                  Join our network of verified experts and connect with clients seeking your expertise
                </p>
              </div>
              <Button 
                onClick={() => navigate('/expert/register')}
                className="shrink-0"
              >
                Register as an Expert
              </Button>
            </div>
          </CardContent>
        </Card>
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
                      {expert.location || 'Location not specified'}
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

                {expert.consultation_fee && (
                  <p className="text-sm font-medium">
                    Consultation: ${expert.consultation_fee}
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
    </div>
  );
}