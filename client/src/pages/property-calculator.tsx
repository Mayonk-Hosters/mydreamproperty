import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Calculator, IndianRupee } from "lucide-react";

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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/50">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            Property Area Converter
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg">
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
                          className="h-14 text-xl border-2 border-blue-200 focus:border-blue-500 rounded-lg"
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
                            <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500 rounded-lg">
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
                            <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-500 rounded-lg">
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
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  Convert Area
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={swapUnits}
                  className="h-14 px-6 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>

          {result !== null && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Conversion Result</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {result.toLocaleString()} {areaUnits.find(u => u.value === form.getValues("toUnit"))?.label}
                  </p>
                  <p className="text-gray-500 mt-2">
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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/50">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            EMI Calculator
          </CardTitle>
          <CardDescription className="text-green-100 text-lg">
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
                          <IndianRupee className="h-5 w-5 text-green-600" />
                          Loan Amount
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1000" 
                            {...field} 
                            className="h-12 text-lg border-2 border-green-200 focus:border-green-500 rounded-lg"
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
                            className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
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
                            className="h-12 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-lg"
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
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg"
                >
                  Calculate EMI
                </Button>
              </div>
            </form>
          </Form>

          {result && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Monthly EMI</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{result.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                <h3 className="text-lg font-semibold mb-2 text-orange-800">Total Interest</h3>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-semibold mb-2 text-green-800">Total Payment</h3>
                <p className="text-3xl font-bold text-green-600">
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Property Calculators
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Essential tools for property calculations - convert area units and calculate loan EMIs with precision
        </p>
      </div>

      <Tabs defaultValue="area" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
          <TabsTrigger value="area" className="text-lg font-semibold">
            Area Converter
          </TabsTrigger>
          <TabsTrigger value="emi" className="text-lg font-semibold">
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