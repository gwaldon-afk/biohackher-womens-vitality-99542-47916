import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { ExpertProfile, SPECIALTIES } from "@/types/experts";
import { Save } from "lucide-react";

const formSchema = z.object({
  practice_name: z.string().min(2),
  bio: z.string().min(50).max(1000),
  specialties: z.array(z.string()).min(1),
  location: z.string().min(2),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  consultation_fee: z.number().min(0).optional(),
  accepts_insurance: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpertProfileEditorProps {
  profile: ExpertProfile;
}

export const ExpertProfileEditor = ({ profile }: ExpertProfileEditorProps) => {
  const { updateProfile } = useExpertProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practice_name: profile.practice_name || "",
      bio: profile.bio || "",
      specialties: profile.specialties || [],
      location: profile.location || "",
      phone: profile.phone || "",
      website: profile.website || "",
      consultation_fee: profile.consultation_fee || 0,
      accepts_insurance: profile.accepts_insurance,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await updateProfile(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
        <CardDescription>Update your practice information and services</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="practice_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practice Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={() => (
                <FormItem>
                  <FormLabel>Specialties</FormLabel>
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
                                  if (checked) {
                                    field.onChange([...value, specialty]);
                                  } else {
                                    field.onChange(value.filter((v) => v !== specialty));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
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

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Phone</FormLabel>
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consultation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    I accept insurance
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};