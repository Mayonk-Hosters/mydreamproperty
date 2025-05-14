import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRightLeft, Landmark } from "lucide-react";
import { Layout } from "@/components/common/layout";

// Define conversion factors
const CONVERSION_FACTORS = {
  // Area conversions
  squareFeet: {
    squareFeet: 1,
    squareMeters: 0.092903,
    squareYards: 0.111111,
    acres: 0.0000229568,
    hectares: 0.0000092903,
    bigha: 0.0000458333, // Indian Bigha (varies by region)
    guntha: 0.0009182736,
    marla: 0.00222395,
  },
  squareMeters: {
    squareFeet: 10.7639,
    squareMeters: 1,
    squareYards: 1.19599,
    acres: 0.000247105,
    hectares: 0.0001,
    bigha: 0.0004935, // Indian Bigha (varies by region)
    guntha: 0.009884215,
    marla: 0.02395,
  },
  squareYards: {
    squareFeet: 9,
    squareMeters: 0.836127,
    squareYards: 1,
    acres: 0.000206612,
    hectares: 0.0000836127,
    bigha: 0.000412458, // Indian Bigha (varies by region)
    guntha: 0.008264463,
    marla: 0.02,
  },
  acres: {
    squareFeet: 43560,
    squareMeters: 4046.86,
    squareYards: 4840,
    acres: 1,
    hectares: 0.404686,
    bigha: 2, // Indian Bigha (varies by region)
    guntha: 40,
    marla: 96.8,
  },
  hectares: {
    squareFeet: 107639,
    squareMeters: 10000,
    squareYards: 11959.9,
    acres: 2.47105,
    hectares: 1,
    bigha: 4.9421, // Indian Bigha (varies by region)
    guntha: 98.84215,
    marla: 239.5,
  },
  bigha: {
    squareFeet: 21780, // Indian Bigha (varies by region)
    squareMeters: 2025.32,
    squareYards: 2420,
    acres: 0.5,
    hectares: 0.2023,
    bigha: 1,
    guntha: 20,
    marla: 48.8,
  },
  guntha: {
    squareFeet: 1089,
    squareMeters: 101.17,
    squareYards: 121,
    acres: 0.025,
    hectares: 0.0101,
    bigha: 0.05, // Indian Bigha (varies by region)
    guntha: 1,
    marla: 2.42,
  },
  marla: {
    squareFeet: 450,
    squareMeters: 41.81,
    squareYards: 50,
    acres: 0.01033,
    hectares: 0.004181,
    bigha: 0.02066, // Indian Bigha (varies by region)
    guntha: 0.4132,
    marla: 1,
  },
};

const areaUnits = [
  { label: "Square Feet", value: "squareFeet" },
  { label: "Square Meters", value: "squareMeters" },
  { label: "Square Yards", value: "squareYards" },
  { label: "Acres", value: "acres" },
  { label: "Hectares", value: "hectares" },
  { label: "Bigha", value: "bigha" },
  { label: "Guntha", value: "guntha" },
  { label: "Marla", value: "marla" },
];

// Define form schema
const calculatorSchema = z.object({
  value: z.coerce.number().positive("Value must be positive"),
  fromUnit: z.string(),
  toUnit: z.string(),
});

// Loan Schema
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
      value: 0,
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Area Unit Converter
        </CardTitle>
        <CardDescription>
          Convert between different property area units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
              <FormField
                control={form.control}
                name="fromUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areaUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-4"
                onClick={swapUnits}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <FormField
                control={form.control}
                name="toUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areaUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">Convert</Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium">Result:</p>
            <p className="text-2xl font-bold">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
          </div>
        )}
      </CardContent>
    </Card>
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
    
    setResult({
      emi,
      totalInterest,
      totalPayment
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Home Loan EMI Calculator
        </CardTitle>
        <CardDescription>
          Calculate your monthly EMI, total interest and payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Enter the principal loan amount</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (% per annum)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormDescription>Enter the annual interest rate</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loanTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Term (years)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Enter the loan duration in years</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Calculate EMI</Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
            <div>
              <p className="text-sm font-medium">Monthly EMI:</p>
              <p className="text-xl font-bold">₹ {result.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Interest Payable:</p>
              <p className="text-lg font-semibold">₹ {result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Payment (Principal + Interest):</p>
              <p className="text-lg font-semibold">₹ {result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PropertyCalculatorPage() {
  return (
    <Layout>
      <Helmet>
        <title>Property Calculators | My Dream Property</title>
        <meta 
          name="description" 
          content="Use our property calculators to convert between different area units and calculate your home loan EMI." 
        />
      </Helmet>
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Property Calculators</h1>
        
        <p className="text-gray-600 mb-8">
          Use our calculators to help with your property decisions. Convert between different area units 
          or calculate your potential home loan EMI payments.
        </p>
        
        <Tabs defaultValue="area" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="area" className="flex items-center space-x-2">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Area Converter</span>
            </TabsTrigger>
            <TabsTrigger value="emi" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>EMI Calculator</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="area" className="mt-6">
            <AreaConverter />
          </TabsContent>
          
          <TabsContent value="emi" className="mt-6">
            <EMICalculator />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}