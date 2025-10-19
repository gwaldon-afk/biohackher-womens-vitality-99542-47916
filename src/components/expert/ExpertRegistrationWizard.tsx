import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { SPECIALTIES, ExpertTier } from "@/types/experts";
import { TierSelectionCard } from "./TierSelectionCard";
import { Upload, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  // Step 1: About Your Practice
  practice_name: z.string().min(2, "Practice name required"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty").max(3, "Maximum 3 specialties"),
  years_of_practice: z.number().min(0).max(100),
  address_line1: z.string().min(3, "Address required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state_province: z.string().min(2, "State/Province required"),
  postal_code: z.string().min(3, "Postal code required"),
  country: z.string().min(2, "Country required"),
  offers_in_person: z.boolean().default(true),
  offers_virtual_video: z.boolean().default(false),
  offers_virtual_phone: z.boolean().default(false),
  offers_virtual_messaging: z.boolean().default(false),
  
  // Step 2: Professional Story
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional(),
  
  // Step 3: Credentials
  license_number: z.string().min(3, "License number required"),
  insurance_number: z.string().min(3, "Insurance number required"),
  
  // Step 4: Services & Pricing
  consultation_fee: z.number().min(0).optional(),
  accepts_insurance: z.boolean().default(false),
  
  // Step 5: Partnership
  tier: z.enum(['free', 'premium', 'elite']).default('free'),
  terms_accepted: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type FormValues = z.infer<typeof formSchema>;

export function ExpertRegistrationWizard() {
  const navigate = useNavigate();
  const { createProfile } = useExpertProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practice_name: "",
      bio: "",
      specialties: [],
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "Australia",
      offers_in_person: true,
      offers_virtual_video: false,
      offers_virtual_phone: false,
      offers_virtual_messaging: false,
      phone: "",
      website: "",
      email: "",
      years_of_practice: 0,
      license_number: "",
      insurance_number: "",
      consultation_fee: 0,
      accepts_insurance: false,
      tier: 'free',
      terms_accepted: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await createProfile(values);
    if (result) {
      toast.success("Application submitted successfully!");
      navigate('/expert/dashboard');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['practice_name', 'specialties', 'years_of_practice', 'address_line1', 'city', 'state_province', 'postal_code', 'country'];
        break;
      case 2:
        fieldsToValidate = ['bio'];
        break;
      case 3:
        fieldsToValidate = ['license_number', 'insurance_number'];
        break;
      case 4:
        fieldsToValidate = ['consultation_fee', 'accepts_insurance'];
        break;
      case 5:
        fieldsToValidate = ['tier', 'terms_accepted'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="container max-w-4xl py-8">
      {/* Header with Exit Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Expert Partner Registration</h1>
          <p className="text-muted-foreground">Join our network of verified health professionals</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/experts')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span className="text-xs">~5 minutes to complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: About Your Practice */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>About Your Practice</CardTitle>
                <CardDescription>Tell us about your practice location and specialties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="practice_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Clinic or Practice Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialties"
                  render={() => (
                    <FormItem>
                      <FormLabel>Primary Specialties * (Select up to 3)</FormLabel>
                      <div className="grid md:grid-cols-2 gap-3">
                        {SPECIALTIES.map((specialty) => (
                          <FormField
                            key={specialty}
                            control={form.control}
                            name="specialties"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(specialty)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      if (checked && value.length < 3) {
                                        field.onChange([...value, specialty]);
                                      } else if (!checked) {
                                        field.onChange(value.filter((v) => v !== specialty));
                                      }
                                    }}
                                    disabled={!field.value?.includes(specialty) && field.value?.length >= 3}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {specialty}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_of_practice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Practice *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Practice Address</h3>
                  
                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Suite, unit, building, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state_province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Consultation Types Offered</h3>
                  
                  <FormField
                    control={form.control}
                    name="offers_in_person"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          In-person consultations at practice location
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="ml-6 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Virtual Consultation Options:</p>
                    
                    <FormField
                      control={form.control}
                      name="offers_virtual_video"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Video calls (Zoom, Google Meet, etc.)
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offers_virtual_phone"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Phone consultations
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offers_virtual_messaging"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Secure messaging/email consultations
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional Story */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Professional Story</CardTitle>
                <CardDescription>Help clients understand your approach and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's your approach to women's health? What makes your practice unique?" 
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0} / 1000 characters (minimum 50)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="practice@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+61 xxx xxx xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourpractice.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Credentials */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Credentials & Verification</CardTitle>
                <CardDescription>Your credentials will be verified by our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="License #" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Insurance Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Insurance #" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Credentials</p>
                  <p className="text-xs text-muted-foreground">
                    You'll be able to upload documents after submitting your application
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Required Documents:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Professional medical license</li>
                    <li>Professional indemnity insurance certificate</li>
                    <li>Additional certifications (optional)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Services & Pricing */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Services & Pricing</CardTitle>
                <CardDescription>Set your consultation fees and insurance options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="consultation_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Consultation Fee</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            placeholder="150"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Your standard consultation fee in your local currency</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accepts_insurance"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        I accept health insurance
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm">
                    💡 <strong>Tip:</strong> You can add detailed service offerings and customize pricing in your dashboard after approval.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Partnership Details */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Partnership Tier</CardTitle>
                <CardDescription>Select the plan that best fits your practice goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <TierSelectionCard 
                        currentTier={field.value as ExpertTier}
                        onSelectTier={(tier) => field.onChange(tier)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-lg">How Referrals Work</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>When BiohackHer members purchase products through your recommendations, you earn commission</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Track all referrals and earnings in your expert dashboard</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Monthly payouts via Stripe Connect</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Commission rates vary by tier: Free (10%), Premium (20%), Elite (30%)</span>
                    </li>
                  </ul>
                </div>

                <FormField
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer leading-relaxed">
                        I agree to the BiohackHer Expert Partner Terms & Conditions, including verification requirements, 
                        professional conduct standards, and commission structure *
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}