import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertContactSubmissionSchema } from '@shared/schema';

const contactFormSchema = insertContactSubmissionSchema.extend({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().min(9, 'מספר טלפון חייב להכיל לפחות 9 ספרות'),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  eventType: z.string().min(1, 'נא לבחור סוג אירוע'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      eventType: '',
      guestCount: undefined,
      eventDate: '',
      budget: '',
      details: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'הפנייה נשלחה בהצלחה!',
        description: 'נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת',
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: 'שגיאה בשליחת הפנייה',
        description: 'אנא נסו שוב או צרו קשר טלפוני',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-dark-brown to-wine-red text-white relative overflow-hidden">
      <div className="absolute inset-0 organic-shape bg-golden opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-cornsilk font-semibold text-lg tracking-wide">צרו קשר</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 mt-2">בואו נתכנן יחד את האירוע המושלם</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            הצוות המקצועי שלנו כאן כדי להפוך את החלום שלכם למציאות. צרו קשר עכשיו לייעוץ חינם ומקצועי.
          </p>
          <div className="w-24 h-1 bg-cornsilk mx-auto mt-6"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white bg-opacity-10 glass-effect rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">טופס יצירת קשר מתקדם</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white">שם מלא *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="הזינו את שמכם המלא"
                            className="bg-white text-dark-brown"
                          />
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
                        <FormLabel className="text-sm font-semibold text-white">טלפון *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="054-123-4567"
                            className="bg-white text-dark-brown"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-white">אימייל</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="email@example.com"
                          className="bg-white text-dark-brown"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white">סוג האירוע *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white text-dark-brown">
                              <SelectValue placeholder="בחרו סוג אירוע" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wedding">חתונה</SelectItem>
                            <SelectItem value="bar-mitzvah">בר/בת מצווה</SelectItem>
                            <SelectItem value="corporate">אירוע עסקי</SelectItem>
                            <SelectItem value="memorial">אירוע הזכרון</SelectItem>
                            <SelectItem value="birthday">יום הולדת</SelectItem>
                            <SelectItem value="holiday">חג ומועד</SelectItem>
                            <SelectItem value="other">אחר</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white">מספר אורחים משוער</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="10"
                            max="500"
                            placeholder="50"
                            className="bg-white text-dark-brown"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white">תאריך האירוע</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            className="bg-white text-dark-brown"
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-white">תקציב משוער</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="bg-white text-dark-brown">
                              <SelectValue placeholder="בחרו טווח תקציב" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">עד ₪5,000</SelectItem>
                            <SelectItem value="mid">₪5,000 - ₪15,000</SelectItem>
                            <SelectItem value="premium">₪15,000 - ₪30,000</SelectItem>
                            <SelectItem value="luxury">מעל ₪30,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-white">פרטים נוספים</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="ספרו לנו עוד על האירוע שלכם, העדפות מיוחדות, אלרגיות או כל פרט שחשוב לכם..."
                          className="bg-white text-dark-brown"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg w-full md:w-auto"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        שולח...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane ml-2"></i>
                        שלחו את הפנייה
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-sm text-gray-300 text-center">
                  נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת
                </p>
              </form>
            </Form>
          </div>
          
          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white bg-opacity-10 glass-effect rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">פרטי יצירת קשר</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                    <i className="fas fa-phone text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">טלפון</h4>
                    <a href="tel:052-1234567" className="text-cornsilk hover:text-golden transition-colors">052-123-4567</a>
                    <p className="text-sm text-gray-300">זמינים 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-wine-red rounded-full flex items-center justify-center">
                    <i className="fab fa-whatsapp text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">WhatsApp</h4>
                    <a href="https://wa.me/972521234567" target="_blank" rel="noopener noreferrer" className="text-cornsilk hover:text-golden transition-colors">052-123-4567</a>
                    <p className="text-sm text-gray-300">תגובה מיידית</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-saddle-brown rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">כתובת</h4>
                    <p className="text-cornsilk">מדינת היהודים 85</p>
                    <p className="text-cornsilk">קניון עזריאלי אאוטלט</p>
                    <p className="text-cornsilk">הרצליה פיתוח</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">שעות פתיחה</h4>
                    <p className="text-cornsilk">ראשון-חמישי: 9:00-22:00</p>
                    <p className="text-cornsilk">שישי: 9:00-14:00</p>
                    <p className="text-cornsilk">מוצ"ש: 20:00-24:00</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button
                  asChild
                  className="bg-golden hover:bg-dark-golden text-white p-3 rounded-xl text-center font-semibold hover-lift"
                >
                  <a href="tel:052-1234567">
                    <i className="fas fa-phone-alt mb-2 block"></i>
                    חייגו עכשיו
                  </a>
                </Button>
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl text-center font-semibold hover-lift"
                >
                  <a href="https://wa.me/972521234567" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-whatsapp mb-2 block"></i>
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-white bg-opacity-10 glass-effect rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">איך מגיעים אלינו</h3>
              <div className="bg-gray-300 rounded-xl h-48 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <i className="fas fa-map-marked-alt text-4xl mb-2"></i>
                  <p>מפה אינטראקטיבית</p>
                  <p className="text-sm">מדינת היהודים 85, הרצליה פיתוח</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-300">
                <p>• חניה חינם זמינה</p>
                <p>• נגיש לנכים</p>
                <p>• תחבורה ציבורית קרובה</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};