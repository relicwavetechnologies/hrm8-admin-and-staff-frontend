// @ts-nocheck
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Star, Target } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

const baseFeedbackSchema = z.object({
  overallRating: z.number().min(1).max(5),
  strengths: z.string().min(10, "Please provide detailed strengths"),
  concerns: z.string().min(10, "Please provide detailed concerns"),
  recommendation: z.enum(["strong-yes", "yes", "maybe", "no", "strong-no"]),
  notes: z.string().optional(),
});

const defaultFeedbackSchema = baseFeedbackSchema.extend({
  technicalSkills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
});

type FeedbackFormData = z.infer<typeof defaultFeedbackSchema> & {
  customRatings?: Record<string, number>;
};

interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface InterviewFeedbackFormProps {
  candidateName: string;
  jobTitle: string;
  ratingCriteria?: RatingCriteria[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function InterviewFeedbackForm({ 
  candidateName, 
  jobTitle, 
  ratingCriteria,
  onSubmit, 
  onCancel 
}: InterviewFeedbackFormProps) {
  const hasCustomCriteria = ratingCriteria && ratingCriteria.length > 0;
  
  // Create dynamic schema based on rating criteria
  const feedbackSchema = hasCustomCriteria 
    ? baseFeedbackSchema.extend({
        customRatings: z.record(z.number().min(1).max(5))
      })
    : defaultFeedbackSchema;

  const form = useForm<any>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      ...(hasCustomCriteria 
        ? { customRatings: Object.fromEntries(
            ratingCriteria.map(c => [c.id, 3])
          )}
        : {
            technicalSkills: 3,
            communication: 3,
            cultureFit: 3,
            problemSolving: 3,
          }
      ),
      overallRating: 3,
      recommendation: "maybe",
    },
  });

  // Calculate weighted score automatically
  const calculateWeightedScore = (): number => {
    if (!hasCustomCriteria) return form.getValues("overallRating");
    
    const customRatings = form.getValues("customRatings") || {};
    let totalScore = 0;
    let totalWeight = 0;

    ratingCriteria.forEach((criteria) => {
      const rating = customRatings[criteria.id] || 3;
      totalScore += rating * (criteria.weight / 100);
      totalWeight += criteria.weight;
    });

    // Normalize if weights don't add up to 100
    return totalWeight > 0 ? (totalScore * 100) / totalWeight : 3;
  };

  // Watch all custom ratings and update overall rating
  const customRatings = form.watch("customRatings");
  
  useEffect(() => {
    if (hasCustomCriteria && customRatings) {
      const weightedScore = calculateWeightedScore();
      form.setValue("overallRating", Number(weightedScore.toFixed(2)), { 
        shouldValidate: false,
        shouldDirty: false 
      });
    }
  }, [customRatings, hasCustomCriteria]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold">{candidateName}</h3>
        <p className="text-sm text-muted-foreground">{jobTitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Criteria */}
          {hasCustomCriteria ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Interview Scorecard</h3>
              </div>
              <Card className="p-4 bg-muted/50 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Rate the candidate based on the following criteria from the interview template
                </p>
              </Card>

              {ratingCriteria.map((criteria) => {
                const rating = form.watch(`customRatings.${criteria.id}`) || 3;
                return (
                  <FormField
                    key={criteria.id}
                    control={form.control}
                    name={`customRatings.${criteria.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{criteria.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                Weight: {criteria.weight}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-normal">
                              {criteria.description}
                            </p>
                          </div>
                          {renderStars(rating)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value || 3]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="mt-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}

              <FormField
                control={form.control}
                name="overallRating"
                render={({ field }) => {
                  const weightedScore = calculateWeightedScore();
                  const breakdown = ratingCriteria.map((criteria) => {
                    const rating = form.getValues(`customRatings.${criteria.id}`) || 3;
                    const contribution = (rating * criteria.weight) / 100;
                    return { ...criteria, rating, contribution };
                  });

                  return (
                    <FormItem className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <FormLabel>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base font-bold">Weighted Overall Rating</span>
                          <div className="flex items-center gap-2">
                            {renderStars(Math.round(weightedScore))}
                            <span className="text-2xl font-bold text-primary">
                              {weightedScore.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </FormLabel>
                      
                      <div className="mt-3 p-3 bg-background/50 rounded border space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Score Breakdown
                        </p>
                        {breakdown.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {item.name} ({item.weight}%)
                            </span>
                            <span className="font-mono">
                              {item.rating} × {item.weight}% = {item.contribution.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t mt-2">
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>Total Weighted Score</span>
                            <span className="text-primary">{weightedScore.toFixed(2)} / 5.0</span>
                          </div>
                        </div>
                      </div>
                      
                      <FormDescription className="mt-3 text-xs">
                        Overall rating is automatically calculated based on weighted criteria scores
                      </FormDescription>
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rating Criteria</h3>
              
              <FormField
                control={form.control}
                name="technicalSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Technical Skills</span>
                      {renderStars(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Communication</span>
                      {renderStars(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cultureFit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Culture Fit</span>
                      {renderStars(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problemSolving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Problem Solving</span>
                      {renderStars(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overallRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Overall Rating</span>
                      {renderStars(field.value)}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Written Feedback */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Written Feedback</h3>

            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strengths</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did the candidate do well? What impressed you?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concerns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concerns</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What areas need improvement? Any red flags?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other observations or comments..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recommendation */}
          <FormField
            control={form.control}
            name="recommendation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hiring Recommendation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="strong-yes">Strong Yes - Definitely hire</SelectItem>
                    <SelectItem value="yes">Yes - Would be a good hire</SelectItem>
                    <SelectItem value="maybe">Maybe - On the fence</SelectItem>
                    <SelectItem value="no">No - Not a good fit</SelectItem>
                    <SelectItem value="strong-no">Strong No - Definitely do not hire</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your overall recommendation for this candidate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit Feedback</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
