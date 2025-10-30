import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import brandFaceLogo from "@/assets/brand-face-logo.jpg";
import { Heart, Users, Award, Mic, Mail, MapPin, Phone, Send, BookOpen, Target, Sparkles, GraduationCap, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTotalStudyCount } from "@/data/researchEvidence";

const About = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'mission';
  const totalStudies = getTotalStudyCount();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            About <span className="text-primary">BiohackHer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Science-backed protocols designed for women's unique biology
          </p>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="mission">Our Mission</TabsTrigger>
            <TabsTrigger value="advisory">Advisory Board</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Mission Tab */}
          <TabsContent value="mission" className="space-y-12">

        {/* Our Story */}
        <section className="mb-16">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">Our Story</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  BiohackHer was born from a simple but powerful observation: <strong className="text-foreground">women's health 
                  is dramatically underserved</strong> in the longevity and biohacking space. While men have access to 
                  extensive research and protocols for optimising their health, women face unique challenges that 
                  are often overlooked or misunderstood.
                </p>
                
                <p>
                  After witnessing countless women struggle with hormonal changes, energy decline, sleep disruption, 
                  and cognitive changes—often being told it's "just part of aging"—our founder Azra knew there had 
                  to be a better way.
                </p>

                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 my-6">
                  <h3 className="text-xl font-semibold text-primary mb-3">Our Mission</h3>
                  <p className="text-foreground">
                    To democratise access to science-backed longevity protocols specifically designed for women's 
                    unique physiology, making personalised health optimisation accessible, affordable, and actionable 
                    for every woman—regardless of age, background, or health literacy.
                  </p>
                </div>

                <p>
                  We believe every woman deserves to feel vibrant, energized, and in control of her health throughout 
                  all life stages. That's why we've built a platform that combines:
                </p>

                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Peer-reviewed research</strong> translated into actionable protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Personalised assessments</strong> that understand your unique symptoms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Evidence-based supplements</strong> recommended by leading experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Community support</strong> from women on similar health journeys</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-16" />

        {/* Meet the Founder */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Meet <span className="text-primary">Our Founder</span>
          </h2>
          
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 flex items-center justify-center">
                <div className="relative">
                  <img 
                    src={brandFaceLogo} 
                    alt="Azra Alagic" 
                    className="rounded-lg shadow-lg max-w-sm w-full"
                  />
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                  Azra Alagic
                </h3>
                <p className="text-lg text-primary font-semibold mb-4">
                  Founder & Longevity Expert
                </p>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    With over a decade of experience in women's hormonal health and longevity research, 
                    Azra founded BiohackHer after witnessing countless women struggle with the changes 
                    happening in their bodies after 35.
                  </p>
                  <p>
                    Her evidence-based approach combines cutting-edge biohacking protocols with personalised 
                    interventions designed specifically for women's unique physiological needs throughout all 
                    life stages.
                  </p>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-sm">10+ Years Women's Health Research</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="text-sm">Certified Longevity Practitioner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm">Helped 10,000+ Women Optimise Their Health</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

          </TabsContent>

          {/* Advisory Board Tab */}
          <TabsContent value="advisory" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-primary">Advisory Board</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every recommendation is validated by leading experts in women's health and longevity science
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">321</div>
                  <p className="text-sm text-muted-foreground">Combined Publications</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">134</div>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">Evidence-Based</p>
                </CardContent>
              </Card>
            </div>

            {/* Sample Advisory Board Members */}
            <div className="space-y-4">
              {[
                {
                  name: "Dr. Sarah Mitchell, PhD",
                  title: "Nutritional Biochemist",
                  specialty: "Hormone Balance & Metabolic Health",
                  publications: 47
                },
                {
                  name: "Dr. Lisa Rodriguez, PharmD",
                  title: "Clinical Pharmacist & Herbalist",
                  specialty: "Supplement Safety & Efficacy",
                  publications: 28
                }
              ].map((advisor, idx) => (
                <Card key={idx}>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardTitle className="text-xl">{advisor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{advisor.title}</p>
                    <Badge variant="outline" className="w-fit">{advisor.specialty}</Badge>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{advisor.publications} Publications</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => navigate('/advisory-board')}>
                <Users className="h-4 w-4 mr-2" />
                View Full Advisory Board
              </Button>
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Research <span className="text-primary">Evidence</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {totalStudies}+ peer-reviewed studies backing every recommendation
              </p>
            </div>

            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle>Our Scientific Review Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Research Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Every recommendation based on peer-reviewed research from reputable journals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Expert Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Advisory board reviews all protocols for clinical relevance and safety
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Continuous Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Protocols updated as new research emerges
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={() => navigate('/research-evidence')}>
                <FileText className="h-4 w-4 mr-2" />
                Browse Research Library
              </Button>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How do I start?</h4>
                  <p className="text-sm text-muted-foreground">
                    Take our 5-minute Longevity Impact Score assessment to get your personalized 7-day protocol.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is this backed by science?</h4>
                  <p className="text-sm text-muted-foreground">
                    Every recommendation is based on 500+ peer-reviewed studies and validated by our advisory board.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is my data secure?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your health data is encrypted (AES-256), never sold, and protected by enterprise-grade security.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button variant="outline" onClick={() => navigate('/faq')}>
                View All FAQs
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Section - Outside Tabs */}
        <Separator className="my-12" />
        
        <section className="mt-12">
          <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">BiohackHer Podcast</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Join Azra as she interviews leading experts in women's health, longevity science, and 
                biohacking. Each episode breaks down complex research into actionable insights you can 
                implement immediately.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Recent Episodes</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Episode 47: Optimising Sleep for Women Over 40</li>
                    <li>• Episode 46: The Truth About Hormone Replacement</li>
                    <li>• Episode 45: Gut Health & Menopausal Symptoms</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Listen On</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Apple Podcasts</Badge>
                    <Badge variant="outline">Spotify</Badge>
                    <Badge variant="outline">YouTube</Badge>
                    <Badge variant="outline">Google Podcasts</Badge>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Mic className="h-4 w-4 mr-2" />
                View All Episodes
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-primary">Media</span> & Press
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>As Seen In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded">
                    <p className="font-semibold">Women's Health Magazine</p>
                    <p className="text-sm text-muted-foreground">
                      "Revolutionizing Women's Longevity"
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded">
                    <p className="font-semibold">The Longevity Podcast</p>
                    <p className="text-sm text-muted-foreground">
                      Guest Feature with Azra Alagic
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded">
                    <p className="font-semibold">Biohacker Summit</p>
                    <p className="text-sm text-muted-foreground">
                      Keynote Speaker 2024
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Press Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For media inquiries, interview requests, or partnership opportunities, 
                  please contact our press team.
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  press@biohackher.com
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Get in <span className="text-primary">Touch</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground">hello@biohackher.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-muted-foreground">London, United Kingdom</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Support Hours</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 9AM - 5PM GMT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 border rounded-md"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <textarea 
                      className="w-full p-2 border rounded-md min-h-[120px]"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
