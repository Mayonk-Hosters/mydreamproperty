import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";

export const AreaCalculator = () => {
  const [length, setLength] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [unit, setUnit] = useState<string>("feet");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateArea = useCallback(() => {
    setError(null);
    
    // Validate inputs
    if (length === "" || width === "") {
      setError("Please enter both length and width");
      return;
    }

    if (typeof length !== "number" || typeof width !== "number") {
      setError("Please enter valid numbers");
      return;
    }

    if (length <= 0 || width <= 0) {
      setError("Length and width must be positive numbers");
      return;
    }

    const area = length * width;
    
    // Calculate different unit conversions
    let sqFeet = 0;
    let sqMeters = 0;
    let sqYards = 0;
    let sqGuntha = 0; // 1 Guntha = 1089 sq ft
    let sqBigha = 0;  // 1 Bigha = approximately 27,225 sq ft (varies by region)
    let acres = 0;    // 1 Acre = 43,560 sq ft

    if (unit === "feet") {
      sqFeet = area;
      sqMeters = area * 0.092903;
      sqYards = area * 0.111111;
      sqGuntha = area / 1089;
      sqBigha = area / 27225;
      acres = area / 43560;
    } else if (unit === "meters") {
      sqMeters = area;
      sqFeet = area * 10.7639;
      sqYards = area * 1.19599;
      sqGuntha = (area * 10.7639) / 1089;
      sqBigha = (area * 10.7639) / 27225;
      acres = (area * 10.7639) / 43560;
    } else if (unit === "yards") {
      sqYards = area;
      sqFeet = area * 9;
      sqMeters = area * 0.836127;
      sqGuntha = (area * 9) / 1089;
      sqBigha = (area * 9) / 27225;
      acres = (area * 9) / 43560;
    }

    const resultText = `
      ${sqFeet.toFixed(2)} sq ft
      ${sqMeters.toFixed(2)} sq m
      ${sqYards.toFixed(2)} sq yd
      ${sqGuntha.toFixed(4)} guntha
      ${sqBigha.toFixed(4)} bigha
      ${acres.toFixed(4)} acres
    `;

    setResult(resultText);
  }, [length, width, unit]);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLength(val === "" ? "" : parseFloat(val));
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWidth(val === "" ? "" : parseFloat(val));
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Calculator className="h-5 w-5" />
          Property Area Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Input 
                id="length" 
                type="number" 
                value={length} 
                onChange={handleLengthChange}
                min="0"
                step="0.01"
                placeholder="Enter length"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input 
                id="width" 
                type="number" 
                value={width} 
                onChange={handleWidthChange}
                min="0"
                step="0.01"
                placeholder="Enter width"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select defaultValue={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feet">Feet</SelectItem>
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="yards">Yards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">{error}</div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-semibold mb-2">Result:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {result.trim().split('\n').map((line, index) => (
                  <div key={index} className="py-1">{line.trim()}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={calculateArea} 
          className="w-full"
        >
          Calculate Area
        </Button>
      </CardFooter>
    </Card>
  );
};