import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FuneralData, funeralDataSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Gift, Plus, X, Sparkles } from "lucide-react";

interface FuneralWizardProps {
  initialData?: FuneralData;
  onSave: (data: FuneralData) => void;
  onCancel: () => void;
}

export function FuneralWizard({ initialData, onSave, onCancel }: FuneralWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newItem, setNewItem] = useState("");

  const form = useForm<FuneralData>({
    resolver: zodResolver(funeralDataSchema),
    defaultValues: {
      religiousOrientation: initialData?.religiousOrientation,
      denomination: initialData?.denomination || "",
      spiritualElements: initialData?.spiritualElements || false,
      faithLeader: initialData?.faithLeader || "",
      serviceLocation: initialData?.serviceLocation || "",
      readings: initialData?.readings || [],
      traditions: initialData?.traditions || [],
      dressCode: initialData?.dressCode || "",
      naturePreferences: initialData?.naturePreferences || "",
      poems: initialData?.poems || [],
      music: initialData?.music || [],
      serviceType: initialData?.serviceType,
      disposalMethod: initialData?.disposalMethod,
      disposalDetails: initialData?.disposalDetails || "",
      remainsLocation: initialData?.remainsLocation || "",
      attendees: initialData?.attendees || { include: [], exclude: [] },
      tone: initialData?.tone,
      speakers: initialData?.speakers || [],
      visuals: initialData?.visuals || { photos: false, slideshow: false, videos: false },
      familyNotes: initialData?.familyNotes || "",
    },
  });

  const watchedValues = form.watch();
  const religiousOrientation = watchedValues.religiousOrientation;

  // AI-powered suggestions based on user selections
  const getSuggestions = (category: string, context?: string) => {
    const suggestions: Record<string, Record<string, string[]>> = {
      readings: {
        christian: ["Psalm 23", "1 Corinthians 13:4-8", "John 14:1-3", "Romans 8:38-39"],
        muslim: ["Surah Al-Fatiha", "Surah Al-Baqarah 2:156", "Prayer for the Deceased"],
        jewish: ["Psalm 23", "El Malei Rachamim", "Mourner's Kaddish"],
        hindu: ["Bhagavad Gita 2:20", "Gayatri Mantra", "Om Namah Shivaya"],
        buddhist: ["Heart Sutra", "Dedication of Merit", "Four Noble Truths"],
        spiritual: ["Maya Angelou - 'When Great Trees Fall'", "Rumi - 'Death Is Not the End'", "Native American Blessing"],
        neither: ["'Do Not Stand at My Grave and Weep'", "Shakespeare - Sonnet 18", "Walt Whitman - 'O Captain'"]
      },
      music: {
        christian: ["Amazing Grace", "How Great Thou Art", "In the Sweet By and By", "It Is Well With My Soul"],
        muslim: ["Recitation of Quran", "Nasheed (Islamic songs)", "Peaceful instrumental music"],
        jewish: ["Hatikvah", "Eli Eli", "Traditional Hebrew songs"],
        hindu: ["Bhajans", "Om Namah Shivaya", "Classical Indian music"],
        buddhist: ["Om Mani Padme Hum", "Tibetan chanting", "Peaceful meditation music"],
        spiritual: ["'Somewhere Over the Rainbow'", "'What a Wonderful World'", "Nature sounds"],
        neither: ["'My Way' - Frank Sinatra", "'Time to Say Goodbye'", "'Here Comes the Sun' - Beatles"]
      },
      traditions: {
        christian: ["Communion service", "Hymn singing", "Prayer circle", "Cross blessing"],
        muslim: ["Janazah prayer", "Washing ritual", "White shroud", "Facing Mecca"],
        jewish: ["Sitting Shiva", "Covering mirrors", "Tearing of garments", "Yahrzeit candle"],
        hindu: ["Cremation ceremony", "Offering flowers", "Chanting mantras", "Sacred thread"],
        buddhist: ["Merit transfer", "Meditation session", "Lotus flowers", "Prayer flags"],
        spiritual: ["Smudging ceremony", "Crystal healing", "Candle lighting", "Nature blessing"],
        neither: ["Memory sharing", "Photo display", "Moment of silence", "Releasing balloons"]
      }
    };

    const contextKey = context?.toLowerCase() || 'neither';
    return suggestions[category]?.[contextKey] || suggestions[category]?.neither || [];
  };

  const addArrayItem = (fieldName: keyof FuneralData, value: string) => {
    if (!value.trim()) return;
    const currentArray = (form.getValues(fieldName) as string[]) || [];
    form.setValue(fieldName, [...currentArray, value.trim()] as any);
    setNewItem("");
  };

  const removeArrayItem = (fieldName: keyof FuneralData, index: number) => {
    const currentArray = (form.getValues(fieldName) as string[]) || [];
    form.setValue(fieldName, currentArray.filter((_, i) => i !== index) as any);
  };

  const renderArrayField = (
    fieldName: keyof FuneralData,
    label: string,
    placeholder: string,
    suggestions?: string[]
  ) => {
    const items = (form.getValues(fieldName) as string[]) || [];
    
    return (
      <div className="space-y-3">
        <FormLabel className="text-sm font-medium">{label}</FormLabel>
        
        {/* Display current items */}
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => removeArrayItem(fieldName, index)}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem(fieldName, newItem))}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem(fieldName, newItem)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Suggestions for you:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs border border-dashed border-blue-300 hover:bg-blue-50"
                  onClick={() => addArrayItem(fieldName, suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const steps = [
    {
      title: "Your Beliefs",
      subtitle: "Help us understand your spiritual orientation",
      content: (
        <div className="space-y-6">
          <div className="text-center text-gray-600 mb-6">
            <Gift className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p>This can feel hard to think about. Just share what feels right for you.</p>
          </div>
          
          <FormField
            control={form.control}
            name="religiousOrientation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you consider yourself religious, spiritual, or neither?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose what best describes you" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="religious">Religious - I follow a specific faith tradition</SelectItem>
                    <SelectItem value="spiritual">Spiritual - I believe in something greater, but not organised religion</SelectItem>
                    <SelectItem value="neither">Neither - I prefer secular/non-religious approaches</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {religiousOrientation === 'religious' && (
            <FormField
              control={form.control}
              name="denomination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your faith tradition?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your faith" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Muslim">Muslim</SelectItem>
                      <SelectItem value="Jewish">Jewish</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Sikh">Sikh</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {religiousOrientation === 'spiritual' && (
            <FormField
              control={form.control}
              name="spiritualElements"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I'd like spiritual elements included (readings, music, nature themes)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      )
    },
    {
      title: "Service Details",
      subtitle: "Tell us about your preferred service",
      content: (
        <div className="space-y-6">
          {religiousOrientation === 'religious' && (
            <>
              <FormField
                control={form.control}
                name="faithLeader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred faith leader or celebrant</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pastor Smith from First Baptist Church" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred location for service</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., St. Mary's Church, family home, funeral home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What type of service would you prefer?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="formal">Formal service</SelectItem>
                    <SelectItem value="informal">Informal gathering</SelectItem>
                    <SelectItem value="celebration_of_life">Celebration of life</SelectItem>
                    <SelectItem value="private">Private family only</SelectItem>
                    <SelectItem value="public">Open to all</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What tone should the service have?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose the tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="somber">Somber and respectful</SelectItem>
                    <SelectItem value="celebratory">Celebratory and joyful</SelectItem>
                    <SelectItem value="humour_welcomed">Humour and stories welcomed</SelectItem>
                    <SelectItem value="mixed">A mix of all emotions</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Readings & Traditions",
      subtitle: "Personalize your service with meaningful elements",
      content: (
        <div className="space-y-6">
          {renderArrayField(
            "readings",
            "Readings, prayers, or scriptures",
            "Add a reading or prayer",
            getSuggestions("readings", watchedValues.denomination || religiousOrientation)
          )}

          {religiousOrientation === 'religious' && renderArrayField(
            "traditions",
            "Religious traditions or rites",
            "Add a tradition or ritual",
            getSuggestions("traditions", watchedValues.denomination)
          )}

          {renderArrayField(
            "music",
            "Music or songs",
            "Add a song or music preference",
            getSuggestions("music", watchedValues.denomination || religiousOrientation)
          )}

          {(religiousOrientation === 'spiritual' || religiousOrientation === 'neither') && renderArrayField(
            "poems",
            "Poems, quotes, or readings",
            "Add a poem or meaningful quote"
          )}
        </div>
      )
    },
    {
      title: "Final Arrangements",
      subtitle: "Your wishes for burial or cremation",
      content: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="disposalMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How would you like your remains handled?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="burial">Traditional burial</SelectItem>
                    <SelectItem value="cremation">Cremation</SelectItem>
                    <SelectItem value="eco_burial">Eco-friendly/green burial</SelectItem>
                    <SelectItem value="other">Other arrangements</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remainsLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred location for remains</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., family cemetery, scattered at beach, kept by family" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disposalDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional details or special requests</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any specific details about casket, urn, ceremony, or other arrangements..."
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Personal Touches",
      subtitle: "Make it uniquely yours",
      content: (
        <div className="space-y-6">
          {renderArrayField(
            "speakers",
            "People you'd like to speak or be involved",
            "Add someone special to speak"
          )}

          <div className="space-y-4">
            <FormLabel>Visual elements you'd like included</FormLabel>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="visuals.photos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Photo displays</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visuals.slideshow"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Photo slideshow or video memories</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="familyNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for your family</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., 'Please don't spend too much', 'Keep it simple', 'Celebrate my life', 'Donate flowers to nursing home'..."
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    }
  ];

  const canGoNext = () => {
    if (currentStep === 0) {
      return !!watchedValues.religiousOrientation;
    }
    return true;
  };

  const handleSave = () => {
    onSave(form.getValues());
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-500" />
              Funeral Wishes Wizard
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="outline">
              Save Progress
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="min-h-[400px]">
            <h3 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h3>
            {steps[currentStep].content}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length - 1 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canGoNext()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Complete Wizard
              </Button>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}