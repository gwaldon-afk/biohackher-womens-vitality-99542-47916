import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Heart, Moon, Utensils, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const FAQ = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to anchor after a brief delay to ensure content is rendered
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about your longevity journey with Biohacker®
          </p>
        </div>

        <div className="grid gap-6">
          {/* LIS & Scoring Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                LIS & Scoring System
              </CardTitle>
              <CardDescription>
                Understanding your Longevity Impact Score and biological age projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="what-is-lis">
                  <AccordionTrigger>What is the LIS (Longevity Impact Score)?</AccordionTrigger>
                  <AccordionContent>
                    The Longevity Impact Score (LIS) is a comprehensive daily assessment that measures how your lifestyle choices impact your biological aging. It combines data from sleep, physical activity, stress levels, nutrition, social connections, and cognitive engagement to calculate a single score that predicts your biological age trajectory.
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm"><strong>Score Ranges:</strong></p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• <Badge className="bg-red-100 text-red-800">0-60</Badge> High aging acceleration</li>
                        <li>• <Badge className="bg-yellow-100 text-yellow-800">60-90</Badge> Moderate aging impact</li>
                        <li>• <Badge className="bg-green-100 text-green-800">90-110</Badge> Neutral to slight benefit</li>
                        <li>• <Badge className="bg-emerald-100 text-emerald-800">110+</Badge> Significant longevity benefit</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="biological-age-calculation">
                  <AccordionTrigger>How are the 5-year and 20-year biological age projections calculated?</AccordionTrigger>
                  <AccordionContent>
                    <p>The biological age impact is calculated using a non-linear formula that reflects how lifestyle habits affect aging over time:</p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                      Impact = Base Impact × √(Years ÷ 5)
                    </div>
                    <p className="mt-3"><strong>Why non-linear?</strong> Biological aging doesn't compound indefinitely. Your body adapts to lifestyle patterns, and the marginal impact decreases over time due to:</p>
                    <ul className="mt-2 space-y-1 text-sm ml-4">
                      <li>• Biological adaptation and plateau effects</li>
                      <li>• Genetic factors becoming more influential over time</li>
                      <li>• Environmental changes and natural aging processes</li>
                      <li>• Diminishing returns from lifestyle interventions</li>
                    </ul>
                    <p className="mt-3 text-sm text-blue-700"><strong>Example:</strong> A 2.5-year impact over 5 years becomes 5 years over 20 years (2× multiplier), not 10 years (4× linear multiplier).</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sustained-vs-current">
                  <AccordionTrigger>What's the difference between current LIS and sustained LIS?</AccordionTrigger>
                  <AccordionContent>
                    <p><strong>Current LIS:</strong> Your most recent daily score based on yesterday's or today's inputs.</p>
                    <p className="mt-2"><strong>Sustained LIS:</strong> A 30-day rolling average that smooths out daily fluctuations and provides a more stable picture of your long-term trajectory.</p>
                    <p className="mt-3">The biological age projections use your sustained LIS because single-day habits don't determine long-term health outcomes - consistent patterns do.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="optimal-habits">
                  <AccordionTrigger>What constitutes "optimal habits" for the 135 LIS benchmark?</AccordionTrigger>
                  <AccordionContent>
                    <p>An optimal LIS of 135 represents evidence-based best practices across all longevity factors:</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Moon className="h-4 w-4 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Sleep (7.5-9 hours)</p>
                            <p className="text-xs text-gray-600">Deep sleep 15-20%, REM 20-25%</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Activity className="h-4 w-4 text-green-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Physical Activity</p>
                            <p className="text-xs text-gray-600">150+ min moderate or 75+ min vigorous weekly</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-purple-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Stress Management</p>
                            <p className="text-xs text-gray-600">HRV optimization, meditation, low cortisol</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Utensils className="h-4 w-4 text-orange-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Nutrition</p>
                            <p className="text-xs text-gray-600">Mediterranean/longevity diet, proper timing</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-red-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Social Connections</p>
                            <p className="text-xs text-gray-600">Quality relationships, community engagement</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-indigo-600 mt-1" />
                          <div>
                            <p className="font-medium text-sm">Cognitive Engagement</p>
                            <p className="text-xs text-gray-600">Learning, mental challenges, creativity</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Data & Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources & Privacy</CardTitle>
              <CardDescription>
                How we collect, process, and protect your health information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="data-sources">
                  <AccordionTrigger>What data sources does the app use?</AccordionTrigger>
                  <AccordionContent>
                    <p>Biohacker® integrates multiple data streams for comprehensive health tracking:</p>
                    <div className="mt-3 space-y-2">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="font-medium text-sm">Wearable Devices</p>
                        <p className="text-xs text-gray-600">Apple Watch, Fitbit, Garmin, Oura Ring, Whoop - sleep, HRV, activity</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="font-medium text-sm">Manual Input</p>
                        <p className="text-xs text-gray-600">Nutrition logs, stress levels, social interactions, cognitive activities</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <p className="font-medium text-sm">Health Apps</p>
                        <p className="text-xs text-gray-600">Apple Health, Google Fit integration for comprehensive data sync</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-accuracy">
                  <AccordionTrigger>How accurate are the longevity projections?</AccordionTrigger>
                  <AccordionContent>
                    <p>Our projections are based on peer-reviewed longevity research and large population studies, but individual results vary significantly due to:</p>
                    <ul className="mt-2 space-y-1 text-sm ml-4">
                      <li>• Genetic factors (20-30% of longevity determination)</li>
                      <li>• Environmental factors beyond tracking scope</li>
                      <li>• Medical conditions and interventions</li>
                      <li>• Individual biological response variations</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Disclaimer:</p>
                      <p className="text-xs text-yellow-700">These projections are estimates for educational purposes and should not replace medical advice. Consult healthcare providers for personalised health guidance.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-privacy" id="data-privacy">
                  <AccordionTrigger>How is my health data protected?</AccordionTrigger>
                  <AccordionContent>
                    <p>Your health data security is our top priority:</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>• <strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</div>
                      <div>• <strong>Supabase Security:</strong> Enterprise-grade database with SOC 2 Type II compliance</div>
                      <div>• <strong>Row Level Security:</strong> Your data is isolated and accessible only to you</div>
                      <div>• <strong>No Data Selling:</strong> Your health data is never sold or shared with third parties</div>
                      <div>• <strong>GDPR Compliant:</strong> Full data portability and right to deletion</div>
                      <div>• <strong>User Control:</strong> Export or permanently delete all your data at any time</div>
                      <div>• <strong>Regular Audits:</strong> Security testing and vulnerability assessments conducted quarterly</div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Industry Standards:</p>
                      <p className="text-xs text-blue-700">We follow healthcare data protection standards including ISO 27001 principles and implement security best practices recommended by OWASP and NIST.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Usage & Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>Using the App</CardTitle>
              <CardDescription>
                Getting the most out of your longevity tracking experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="getting-started">
                  <AccordionTrigger>How do I get started with tracking?</AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-sm">
                      <li><strong>1. Connect Devices:</strong> Link your wearables and health apps for automatic data sync</li>
                      <li><strong>2. Baseline Week:</strong> Complete at least 7 days of comprehensive tracking to establish your baseline</li>
                      <li><strong>3. Daily Inputs:</strong> Log nutrition, stress, and social factors that aren't automatically tracked</li>
                      <li><strong>4. Review Trends:</strong> Check your dashboard weekly to identify patterns and improvement areas</li>
                      <li><strong>5. Set Goals:</strong> Use the coaching section to create targeted improvement plans</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="missing-data">
                  <AccordionTrigger>What if I have missing data or forget to track something?</AccordionTrigger>
                  <AccordionContent>
                    <p>The app handles missing data intelligently:</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>• <strong>Interpolation:</strong> Missing values estimated from your historical patterns</div>
                      <div>• <strong>Partial Scores:</strong> LIS calculated with available data, clearly marked as incomplete</div>
                      <div>• <strong>Retroactive Entry:</strong> Add missing data up to 7 days later</div>
                      <div>• <strong>Quality Indicators:</strong> Data completeness shown with confidence levels</div>
                    </div>
                    <p className="mt-3 text-blue-700 text-sm">Aim for at least 80% data completeness for reliable projections.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="improving-score">
                  <AccordionTrigger>How can I improve my LIS score?</AccordionTrigger>
                  <AccordionContent>
                    <p>Focus on these high-impact areas in priority order:</p>
                    <div className="mt-3 space-y-3">
                      <div className="p-3 border border-blue-200 rounded-lg">
                        <p className="font-medium text-sm text-blue-800">1. Sleep Quality (Highest Impact)</p>
                        <p className="text-xs text-blue-600">Consistent 7.5-9 hours, optimise deep sleep and REM phases</p>
                      </div>
                      <div className="p-3 border border-green-200 rounded-lg">
                        <p className="font-medium text-sm text-green-800">2. Physical Activity</p>
                        <p className="text-xs text-green-600">Mix cardio, strength training, and flexibility work</p>
                      </div>
                      <div className="p-3 border border-purple-200 rounded-lg">
                        <p className="font-medium text-sm text-purple-800">3. Stress Management</p>
                        <p className="text-xs text-purple-600">Meditation, breathwork, HRV training</p>
                      </div>
                      <div className="p-3 border border-orange-200 rounded-lg">
                        <p className="font-medium text-sm text-orange-800">4. Nutrition Optimization</p>
                        <p className="text-xs text-orange-600">Mediterranean diet, proper timing, nutrient density</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plateau-breakthrough">
                  <AccordionTrigger>My score has plateaued - what should I do?</AccordionTrigger>
                  <AccordionContent>
                    <p>Score plateaus are normal as your body adapts. Try these strategies:</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>• <strong>Periodization:</strong> Vary your exercise and stress patterns</div>
                      <div>• <strong>Advanced Metrics:</strong> Focus on HRV, sleep architecture, recovery markers</div>
                      <div>• <strong>Precision Nutrition:</strong> Optimise meal timing and micronutrient profiles</div>
                      <div>• <strong>Cognitive Challenges:</strong> Add new learning activities and mental exercises</div>
                      <div>• <strong>Social Expansion:</strong> Deepen existing relationships and build new connections</div>
                    </div>
                    <p className="mt-3 text-blue-700 text-sm">Remember: Maintaining a high score is as valuable as improving it!</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Research & Evidence Ratings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Research & Evidence Ratings</CardTitle>
              <CardDescription>
                Understanding the strength of scientific evidence behind interventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="evidence-levels">
                  <AccordionTrigger>What do the Gold, Silver, Bronze, and Emerging evidence ratings mean?</AccordionTrigger>
                  <AccordionContent>
                    <p>We rate the scientific evidence quality for each longevity intervention to help you make informed decisions:</p>
                    <div className="mt-4 space-y-3">
                      <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                        <p className="font-bold text-sm text-yellow-900">🥇 Gold Evidence</p>
                        <p className="text-xs text-yellow-800 mt-1">Multiple randomized controlled trials (RCTs), meta-analyses, and systematic reviews</p>
                        <p className="text-xs text-yellow-700 mt-2"><em>Example: Mediterranean diet's cardiovascular benefits have gold-standard evidence from numerous large-scale studies.</em></p>
                      </div>
                      <div className="p-3 border-l-4 border-gray-400 bg-gray-50 rounded">
                        <p className="font-bold text-sm text-gray-900">🥈 Silver Evidence</p>
                        <p className="text-xs text-gray-800 mt-1">Multiple observational studies with some RCTs, showing consistent patterns</p>
                        <p className="text-xs text-gray-700 mt-2"><em>Example: Omega-3 supplementation has strong observational data and some controlled trials.</em></p>
                      </div>
                      <div className="p-3 border-l-4 border-amber-600 bg-amber-50 rounded">
                        <p className="font-bold text-sm text-amber-900">🥉 Bronze Evidence</p>
                        <p className="text-xs text-amber-800 mt-1">Preliminary research and mechanistic studies showing biological plausibility</p>
                        <p className="text-xs text-amber-700 mt-2"><em>Example: NMN supplementation has promising mechanistic data but limited long-term human trials.</em></p>
                      </div>
                      <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <p className="font-bold text-sm text-blue-900">🔬 Emerging Evidence</p>
                        <p className="text-xs text-blue-800 mt-1">Promising early findings that require more research validation</p>
                        <p className="text-xs text-blue-700 mt-2"><em>Example: Novel compounds or interventions with initial positive signals but insufficient data.</em></p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground"><strong>Note:</strong> All interventions in our database are evaluated and continuously updated as new research emerges. Higher evidence ratings generally indicate more confidence in effectiveness and safety.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Scientific Basis Section */}
          <Card>
            <CardHeader>
              <CardTitle>Scientific Foundation</CardTitle>
              <CardDescription>
                The research and methodology behind our longevity algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="research-basis">
                  <AccordionTrigger>What scientific research supports the LIS methodology?</AccordionTrigger>
                  <AccordionContent>
                    <p>Our algorithms integrate findings from major longevity studies:</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>• <strong>Blue Zones Research:</strong> Lifestyle patterns from the world's longest-lived populations</div>
                      <div>• <strong>Framingham Heart Study:</strong> 70+ years of cardiovascular and longevity data</div>
                      <div>• <strong>Harvard Study of Adult Development:</strong> 80+ years tracking health and happiness</div>
                      <div>• <strong>UK Biobank:</strong> 500,000+ participant genetic and lifestyle database</div>
                      <div>• <strong>Interventions Testing Program:</strong> NIA-funded longevity intervention research</div>
                    </div>
                    <p className="mt-3 text-gray-600 text-sm">Our team includes longevity researchers, data scientists, and medical advisors who continuously update our models based on emerging research.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="algorithm-updates">
                  <AccordionTrigger>How often are the algorithms updated?</AccordionTrigger>
                  <AccordionContent>
                    <p>We continuously improve our longevity models:</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div>• <strong>Quarterly Reviews:</strong> Algorithm refinements based on new research</div>
                      <div>• <strong>Annual Major Updates:</strong> Significant model improvements and new factors</div>
                      <div>• <strong>User Feedback Integration:</strong> Real-world validation from our community</div>
                      <div>• <strong>Peer Review Process:</strong> External scientific advisory board oversight</div>
                    </div>
                    <p className="mt-3 text-blue-700 text-sm">You'll be notified of significant updates that might affect your scores or projections.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">Our support team is here to help you optimise your longevity journey.</p>
            <div className="flex gap-4 justify-center">
              <Badge variant="outline">support@biohacker.com</Badge>
              <Badge variant="outline">Live Chat Available</Badge>
              <Badge variant="outline">Community Forum</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;