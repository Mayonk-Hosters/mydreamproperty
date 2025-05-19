import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  useNeighborhoods, 
  useNeighborhoodComparison, 
  NeighborhoodComparisonProvider 
} from '@/hooks/use-neighborhood-comparison';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Property Score Card Component
const ScoreCard = ({ title, scores, maxValue = 100, formatter = (val: number) => val }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={scores}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, maxValue]} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip formatter={formatter} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Score" 
              fill="rgba(99, 102, 241, 0.8)"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Amenities Count Card Component
const AmenitiesCard = ({ counts }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Nearby Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={counts}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {counts[0]?.neighborhoods?.map((neighborhood, index) => (
              <Bar 
                key={neighborhood.id} 
                dataKey={`neighborhoods[${index}].count`}
                name={neighborhood.name}
                fill={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Property Price Comparison Card
const PriceComparisonCard = ({ neighborhoods }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Average Property Price</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={neighborhoods.map(n => ({
              name: n.name,
              price: n.metrics?.avgPropertyPrice || 0
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Average Price']} />
            <Legend />
            <Bar 
              dataKey="price" 
              name="Average Price" 
              fill="rgba(99, 102, 241, 0.8)"
              animationDuration={1500} 
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Comparison Page Component
const NeighborhoodComparisonContent = () => {
  const { data: allNeighborhoods, isLoading: isLoadingNeighborhoods } = useNeighborhoods();
  const { 
    selectedNeighborhoods, 
    addNeighborhood, 
    removeNeighborhood, 
    clearNeighborhoods,
    comparisonData,
    isLoading: isLoadingComparison
  } = useNeighborhoodComparison();
  const [activeTab, setActiveTab] = useState('overview');

  // Format scores data for charts
  const getScoresData = (scoreType: string) => {
    return comparisonData.map(neighborhood => ({
      name: neighborhood.name,
      value: neighborhood.metrics?.[scoreType] || 0
    }));
  };

  // Format amenities data for charts
  const getAmenitiesData = () => {
    const amenityTypes = [
      { key: 'schoolsCount', name: 'Schools' },
      { key: 'parksCount', name: 'Parks' },
      { key: 'restaurantsCount', name: 'Restaurants' },
      { key: 'hospitalsCount', name: 'Hospitals' },
      { key: 'shoppingCount', name: 'Shopping' },
      { key: 'groceryStoresCount', name: 'Grocery Stores' },
      { key: 'gymsCount', name: 'Gyms' },
    ];

    return amenityTypes.map(type => ({
      name: type.name,
      neighborhoods: comparisonData.map(neighborhood => ({
        id: neighborhood.id,
        name: neighborhood.name,
        count: neighborhood.metrics?.[type.key] || 0
      }))
    }));
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Neighborhood Comparison</h1>
        <p className="text-gray-500 mb-6">
          Compare neighborhoods side by side to find your perfect location.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Neighborhoods</CardTitle>
            <CardDescription>
              Choose up to 5 neighborhoods to compare
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNeighborhoods ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <Select 
                  onValueChange={(value) => addNeighborhood(parseInt(value))}
                  disabled={selectedNeighborhoods.length >= 5}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a neighborhood" />
                  </SelectTrigger>
                  <SelectContent>
                    {allNeighborhoods
                      ?.sort((a, b) => {
                        // Sort by property count (descending)
                        const countA = (a as any).propertyCount || 0;
                        const countB = (b as any).propertyCount || 0;
                        return countB - countA;
                      })
                      .map(neighborhood => (
                        <SelectItem 
                          key={neighborhood.id} 
                          value={neighborhood.id.toString()}
                          disabled={selectedNeighborhoods.includes(neighborhood.id)}
                        >
                          {neighborhood.name} {(neighborhood as any).propertyCount > 0 && 
                            <span className="text-xs ml-1 text-gray-500">
                              ({(neighborhood as any).propertyCount} properties)
                            </span>
                          }
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Selected neighborhoods:</div>
                  {selectedNeighborhoods.length === 0 ? (
                    <div className="text-sm text-gray-400 italic">None selected</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {comparisonData.map(neighborhood => (
                        <Badge key={neighborhood.id} className="pl-2 pr-1 py-1 flex items-center gap-1">
                          {neighborhood.name}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => removeNeighborhood(neighborhood.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {selectedNeighborhoods.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={clearNeighborhoods}
                  >
                    Clear All
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Neighborhoods Overview</CardTitle>
            <CardDescription>
              {selectedNeighborhoods.length === 0 
                ? "Select neighborhoods to see a comparison" 
                : `Comparing ${selectedNeighborhoods.length} neighborhood${selectedNeighborhoods.length > 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingComparison ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : selectedNeighborhoods.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No neighborhoods selected. Please select neighborhoods to compare.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonData.map(neighborhood => (
                  <motion.div
                    key={neighborhood.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>{neighborhood.name}</CardTitle>
                        <CardDescription>{neighborhood.city}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{neighborhood.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Avg. Property Price:</span>{" "}
                            <span className="text-green-600 font-medium">
                              ₹{neighborhood.metrics?.avgPropertyPrice?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Safety Score:</span>{" "}
                            <span className="text-blue-600 font-medium">
                              {neighborhood.metrics?.safetyScore || "N/A"}/100
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Walkability:</span>{" "}
                            <span>{neighborhood.metrics?.walkabilityScore || "N/A"}/100</span>
                          </div>
                          <div>
                            <span className="font-medium">Public Transport:</span>{" "}
                            <span>{neighborhood.metrics?.publicTransportScore || "N/A"}/100</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedNeighborhoods.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Scores Overview</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="prices">Property Prices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreCard 
                title="Safety Scores" 
                scores={getScoresData('safetyScore')} 
                formatter={(val) => `${val}/100`}
              />
              <ScoreCard 
                title="Walkability" 
                scores={getScoresData('walkabilityScore')} 
                formatter={(val) => `${val}/100`}
              />
              <ScoreCard 
                title="Public Transport" 
                scores={getScoresData('publicTransportScore')} 
                formatter={(val) => `${val}/100`}
              />
              <ScoreCard 
                title="Schools Rating" 
                scores={getScoresData('schoolsScore')} 
                formatter={(val) => `${val}/100`}
              />
              <ScoreCard 
                title="Dining Options" 
                scores={getScoresData('diningScore')} 
                formatter={(val) => `${val}/100`}
              />
              <ScoreCard 
                title="Entertainment" 
                scores={getScoresData('entertainmentScore')} 
                formatter={(val) => `${val}/100`}
              />
            </div>
          </TabsContent>

          <TabsContent value="amenities">
            <AmenitiesCard counts={getAmenitiesData()} />
          </TabsContent>

          <TabsContent value="prices">
            <PriceComparisonCard neighborhoods={comparisonData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Wrapper component that provides the context
const NeighborhoodComparison = () => {
  return (
    <NeighborhoodComparisonProvider>
      <NeighborhoodComparisonContent />
    </NeighborhoodComparisonProvider>
  );
};

export default NeighborhoodComparison;