import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Calculator, IndianRupee, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Area conversion factors (all relative to square feet)
const CONVERSION_FACTORS = {
  squareFeet: {
    squareFeet: 1,
    squareMeters: 0.092903,
    acres: 0.000022957,
    hectares: 0.000009290304,
    squareYards: 0.111111,
    squareInches: 144,
  },
  squareMeters: {
    squareFeet: 10.7639,
    squareMeters: 1,
    acres: 0.000247105,
    hectares: 0.0001,
    squareYards: 1.19599,
    squareInches: 1550,
  },
  acres: {
    squareFeet: 43560,
    squareMeters: 4046.86,
    acres: 1,
    hectares: 0.404686,
    squareYards: 4840,
    squareInches: 6272640,
  },
  hectares: {
    squareFeet: 107639,
    squareMeters: 10000,
    acres: 2.47105,
    hectares: 1,
    squareYards: 11959.9,
    squareInches: 15500031,
  },
  squareYards: {
    squareFeet: 9,
    squareMeters: 0.836127,
    acres: 0.000206612,
    hectares: 0.000083612736,
    squareYards: 1,
    squareInches: 1296,
  },
  squareInches: {
    squareFeet: 0.00694444,
    squareMeters: 0.00064516,
    acres: 1.5942e-7,
    hectares: 6.4516e-8,
    squareYards: 0.000771605,
    squareInches: 1,
  },
};

const areaUnits = [
  { value: "squareFeet", label: "Square Feet (sq ft)" },
  { value: "squareMeters", label: "Square Meters (sq m)" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "squareYards", label: "Square Yards (sq yd)" },
  { value: "squareInches", label: "Square Inches (sq in)" },
];

const calculatorSchema = z.object({
  value: z.coerce.number().positive("Value must be positive"),
  fromUnit: z.string().min(1, "Please select a unit"),
  toUnit: z.string().min(1, "Please select a unit"),
});

const loanSchema = z.object({
  amount: z.coerce.number().positive("Loan amount must be positive"),
  interestRate: z.coerce.number().positive("Interest rate must be positive"),
  loanTerm: z.coerce.number().positive("Loan term must be positive"),
});



function AreaConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<z.infer<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      value: 1000,
      fromUnit: "squareFeet",
      toUnit: "squareMeters",
    },
  });

  function onSubmit(values: z.infer<typeof calculatorSchema>) {
    const { value, fromUnit, toUnit } = values;
    const converted = value * (CONVERSION_FACTORS[fromUnit as keyof typeof CONVERSION_FACTORS][toUnit as keyof typeof CONVERSION_FACTORS[keyof typeof CONVERSION_FACTORS]]);
    setResult(converted);
  }

  const swapUnits = () => {
    const fromUnit = form.getValues("fromUnit");
    const toUnit = form.getValues("toUnit");
    form.setValue("fromUnit", toUnit);
    form.setValue("toUnit", fromUnit);
    // Recalculate on swap
    if (form.getValues("value") > 0) {
      onSubmit(form.getValues());
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
          <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
            <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            Property Area Converter
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg relative z-10">
            Convert between different area units with precision and ease
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Value to Convert</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          className="h-14 text-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300"
                          placeholder="Enter area value"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">Enter the area value you want to convert</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <FormField
                    control={form.control}
                    name="fromUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">From Unit</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg transition-all duration-300">
                              <SelectValue placeholder="Select from unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {areaUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <FormField
                    control={form.control}
                    name="toUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">To Unit</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-12 border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-lg transition-all duration-300">
                              <SelectValue placeholder="Select to unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {areaUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Convert Area
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={swapUnits}
                  className="h-14 px-6 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-600 hover:text-purple-700 transition-all duration-300"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>

          {result !== null && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Conversion Result</h3>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-100">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {result.toLocaleString()} {areaUnits.find(u => u.value === form.getValues("toUnit"))?.label}
                  </p>
                  <p className="text-gray-600 mt-3 text-lg">
                    {form.getValues("value")} {areaUnits.find(u => u.value === form.getValues("fromUnit"))?.label} = {result.toLocaleString()} {areaUnits.find(u => u.value === form.getValues("toUnit"))?.label}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EMICalculator() {
  const [result, setResult] = useState<{ emi: number; totalInterest: number; totalPayment: number } | null>(null);

  const form = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      amount: 1000000,
      interestRate: 8.5,
      loanTerm: 20,
    },
  });

  function onSubmit(values: z.infer<typeof loanSchema>) {
    const { amount, interestRate, loanTerm } = values;
    
    // Convert annual interest rate to monthly and decimal
    const monthlyInterestRate = interestRate / 12 / 100;
    
    // Convert loan term from years to months
    const loanTermMonths = loanTerm * 12;
    
    // EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths) / 
                (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    
    const totalPayment = emi * loanTermMonths;
    const totalInterest = totalPayment - amount;

    setResult({ emi, totalInterest, totalPayment });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
          <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
            <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
              <Calculator className="h-6 w-6" />
            </div>
            EMI Calculator
          </CardTitle>
          <CardDescription className="text-emerald-100 text-lg relative z-10">
            Calculate your monthly loan payments with detailed breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                          <IndianRupee className="h-5 w-5 text-emerald-600" />
                          Loan Amount
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1000" 
                            {...field} 
                            className="h-12 text-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg transition-all duration-300"
                            placeholder="Enter loan amount"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">Principal loan amount in rupees</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            {...field} 
                            className="h-12 text-lg border-2 border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg transition-all duration-300"
                            placeholder="Enter interest rate"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">Annual interest rate percentage</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <FormField
                    control={form.control}
                    name="loanTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">Loan Term (Years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1" 
                            {...field} 
                            className="h-12 text-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-lg transition-all duration-300"
                            placeholder="Enter loan term"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">Loan duration in years</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Calculate EMI
                </Button>
              </div>
            </form>
          </Form>

          {result && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-emerald-800">Monthly EMI</h3>
                <p className="text-3xl font-bold text-emerald-600">
                  ₹{result.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border-2 border-teal-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-teal-800">Total Interest</h3>
                <p className="text-3xl font-bold text-teal-600">
                  ₹{result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border-2 border-cyan-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-cyan-800">Total Payment</h3>
                <p className="text-3xl font-bold text-cyan-600">
                  ₹{result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



export default function PropertyCalculatorPage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-rose-500 to-orange-500 bg-clip-text text-transparent mb-4">
          Property Calculators
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Essential tools for property calculations - convert area units and calculate loan EMIs with precision
        </p>
      </div>

      <Tabs defaultValue="area" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-16 bg-gradient-to-r from-gray-100 to-gray-200 p-2 rounded-xl shadow-lg">
          <TabsTrigger value="area" className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 rounded-lg">
            Area Converter
          </TabsTrigger>
          <TabsTrigger value="emi" className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 rounded-lg">
            EMI Calculator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="area" className="space-y-6">
          <AreaConverter />
        </TabsContent>
        
        <TabsContent value="emi" className="space-y-6">
          <EMICalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}