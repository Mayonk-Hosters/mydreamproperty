import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Home, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const homeLoanSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  loanType: z.string().min(1, "Please select loan type"),
  loanAmount: z.coerce.number().min(100000, "Minimum loan amount is ₹1,00,000"),
  propertyLocation: z.string().min(2, "Please enter property location"),
  monthlyIncome: z.coerce.number().min(10000, "Please enter your monthly income"),
  employment: z.string().min(1, "Please select employment type"),
});

export default function HomeLoanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof homeLoanSchema>>({
    resolver: zodResolver(homeLoanSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      loanType: "",
      loanAmount: 2500000,
      propertyLocation: "",
      monthlyIncome: 50000,
      employment: "",
    },
  });

  const loanTypes = [
    { value: "home-purchase", label: "Home Purchase Loan" },
    { value: "home-construction", label: "Home Construction Loan" },
    { value: "home-improvement", label: "Home Improvement Loan" },
    { value: "balance-transfer", label: "Balance Transfer" },
    { value: "top-up", label: "Top-up Loan" },
  ];

  const employmentTypes = [
    { value: "salaried", label: "Salaried" },
    { value: "self-employed-business", label: "Self Employed - Business" },
    { value: "self-employed-professional", label: "Self Employed - Professional" },
    { value: "pensioner", label: "Pensioner" },
  ];

  async function onSubmit(values: z.infer<typeof homeLoanSchema>) {
    setIsSubmitting(true);
    
    try {
      // Save to database first
      const response = await fetch('/api/home-loan-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      // Show success message
      alert('Your home loan inquiry has been submitted successfully! Our team will contact you soon.');
      
      // Reset form after successful submission
      form.reset();
      
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Home Loan Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get instant assistance for your home loan requirements. Fill out the form below and connect directly with our loan specialists via WhatsApp for personalized guidance.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Home className="h-6 w-6" />
              </div>
              Home Loan Inquiry Form
            </CardTitle>
            <CardDescription className="text-orange-100 text-lg">
              Get instant assistance for your home loan requirements via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Details Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-700">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="h-12 text-lg border-2 border-orange-200 focus:border-orange-500 rounded-lg"
                              placeholder="Enter your full name"
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
                          <FormLabel className="text-lg font-semibold text-gray-700">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              className="h-12 text-lg border-2 border-orange-200 focus:border-orange-500 rounded-lg"
                              placeholder="Enter your phone number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-lg font-semibold text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              className="h-12 text-lg border-2 border-orange-200 focus:border-orange-500 rounded-lg"
                              placeholder="Enter your email address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Loan Requirements Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Loan Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="loanType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-700">Loan Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 rounded-lg">
                                <SelectValue placeholder="Select loan type" />
                              </SelectTrigger>
                              <SelectContent>
                                {loanTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-700">Loan Amount Required</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="100000" 
                              {...field} 
                              className="h-12 text-lg border-2 border-green-200 focus:border-green-500 rounded-lg"
                              placeholder="Enter loan amount"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">Amount in Indian Rupees (₹)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyLocation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-lg font-semibold text-gray-700">Property Location</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="h-12 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                              placeholder="Enter property location (City, Area)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Financial Details Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Financial Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-700">Employment Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 border-2 border-indigo-200 focus:border-indigo-500 rounded-lg">
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                              <SelectContent>
                                {employmentTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-700">Monthly Income</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="5000" 
                              {...field} 
                              className="h-12 text-lg border-2 border-teal-200 focus:border-teal-500 rounded-lg"
                              placeholder="Enter monthly income"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">Gross monthly income in ₹</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Connecting to WhatsApp...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-6 w-6" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 text-center">
                    <strong>Note:</strong> Your inquiry will be sent directly to our loan specialists via WhatsApp for immediate assistance.
                    We'll help you with loan eligibility, documentation, and approval process.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Loan Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Processing</h3>
            <p className="text-gray-600">Fast loan approval with minimal documentation and quick disbursal process.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600">Get personalized advice from our experienced loan specialists via WhatsApp.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
            <p className="text-gray-600">Competitive interest rates and flexible repayment options tailored for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}