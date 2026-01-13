import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, BookOpen } from "lucide-react";

const AdvisoryBoard = () => {
  const advisors = [
    {
      name: "Dr. Sarah Mitchell, PhD",
      title: "Nutritional Biochemist",
      credentials: "PhD in Nutritional Biochemistry, MS in Clinical Nutrition",
      specialty: "Hormone Balance & Metabolic Health",
      bio: "Dr. Mitchell has spent over 15 years researching the intersection of nutrition, hormones, and aging. She has published 47 peer-reviewed papers on nutritional interventions for menopausal symptoms.",
      publications: 47,
      yearsExperience: 15
    },
    {
      name: "Dr. James Chen, MD",
      title: "Integrative Medicine Physician",
      credentials: "MD, Board Certified Internal Medicine, Fellowship in Integrative Medicine",
      specialty: "Sleep Optimisation & Cognitive Health",
      bio: "Dr. Chen specializes in evidence-based integrative approaches to sleep disorders and cognitive decline. His research focuses on non-pharmaceutical interventions for age-related health concerns.",
      publications: 32,
      yearsExperience: 18
    },
    {
      name: "Prof. Emma Thompson",
      title: "Exercise Physiology Professor",
      credentials: "PhD in Exercise Physiology, CSCS",
      specialty: "Mobility & Strength in Aging",
      bio: "Professor Thompson leads groundbreaking research on maintaining mobility and strength through midlife and beyond. Her work has helped thousands of women reverse age-related physical decline.",
      publications: 56,
      yearsExperience: 22
    },
    {
      name: "Dr. Lisa Rodriguez, PharmD",
      title: "Clinical Pharmacist & Herbalist",
      credentials: "PharmD, Certified Herbalist, MS in Botanical Medicine",
      specialty: "Supplement Safety & Efficacy",
      bio: "Dr. Rodriguez bridges conventional pharmacy with evidence-based botanical medicine. She reviews all supplement recommendations for safety, efficacy, and drug-nutrient interactions.",
      publications: 28,
      yearsExperience: 12
    },
    {
      name: "Dr. Patricia Williams, MD",
      title: "Reproductive Endocrinologist",
      credentials: "MD, Board Certified OB/GYN & Reproductive Endocrinology",
      specialty: "Hormonal Transitions & Menopause",
      bio: "Dr. Williams is a leading expert in perimenopause and menopause management. She has dedicated her 20-year career to helping women navigate hormonal transitions with evidence-based HRT and lifestyle interventions.",
      publications: 41,
      yearsExperience: 20
    },
    {
      name: "Dr. Maya Patel, MD",
      title: "Dermatologist",
      credentials: "MD, Board Certified Dermatology, Fellowship in Cosmetic Dermatology",
      specialty: "Skin Health & Anti-Aging",
      bio: "Dr. Patel specializes in the science of skin aging and evidence-based aesthetic treatments. Her research focuses on nutritional and topical interventions for maintaining youthful, healthy skin.",
      publications: 34,
      yearsExperience: 14
    },
    {
      name: "Dr. Rachel Green, MD, PhD",
      title: "Psychiatrist",
      credentials: "MD, PhD in Neuroscience, Board Certified Psychiatry",
      specialty: "Mental Health & Stress Management",
      bio: "Dr. Green combines neuroscience research with clinical psychiatry to address anxiety, depression, and cognitive health in midlife women. She specializes in non-pharmacological interventions for mental wellness.",
      publications: 38,
      yearsExperience: 16
    },
    {
      name: "Dr. Jennifer Kim, MD",
      title: "Cardiologist",
      credentials: "MD, Board Certified Cardiology, Specialist in Women's Heart Health",
      specialty: "Cardiovascular Longevity",
      bio: "Dr. Kim is a pioneer in women's cardiovascular health, particularly focused on post-menopausal heart disease prevention. Her work emphasizes lifestyle interventions and early detection strategies.",
      publications: 45,
      yearsExperience: 19
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Our <span className="text-primary">Advisory Board</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            BiohackHer's recommendations are reviewed by leading experts in women's health, 
            nutrition, and longevity science to ensure every protocol is evidence-based and safe.
          </p>
        </div>

        {/* Trust Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">321</div>
              <p className="text-sm text-muted-foreground">Combined Publications</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">134</div>
              <p className="text-sm text-muted-foreground">Years Combined Experience</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Evidence-Based Protocols</p>
            </CardContent>
          </Card>
        </div>

        {/* Advisory Board Members */}
        <div className="space-y-6">
          {advisors.map((advisor, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{advisor.name}</CardTitle>
                    <CardDescription className="text-base font-medium text-foreground">
                      {advisor.title}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">{advisor.credentials}</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    {advisor.specialty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {advisor.bio}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{advisor.publications} Publications</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-medium">{advisor.yearsExperience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Board Certified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Methodology */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Our Scientific Review Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Research Review</h4>
                <p className="text-sm text-muted-foreground">
                  Every recommendation is based on peer-reviewed research from reputable journals. 
                  We prioritize RCTs, meta-analyses, and systematic reviews.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expert Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Our advisory board reviews all protocols for clinical relevance, safety, 
                  and efficacy before they're recommended to members.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Continuous Updates</h4>
                <p className="text-sm text-muted-foreground">
                  As new research emerges, our protocols are updated to reflect the latest 
                  evidence-based best practices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdvisoryBoard;
