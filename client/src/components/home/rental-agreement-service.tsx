import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Upload, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RentalAgreementService() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleRequestAgreement = () => {
    toast({
      title: "Request Received",
      description: "Your rental agreement request has been submitted. Our team will contact you shortly.",
    });
    setIsDialogOpen(false);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" /> Rental Agreement Services
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rental Agreement Services</DialogTitle>
          <DialogDescription>
            Streamline your property rental process with our comprehensive rental agreement services.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="owner">For Owners</TabsTrigger>
            <TabsTrigger value="tenant">For Tenants</TabsTrigger>
            <TabsTrigger value="request">Request Service</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Standard Rental Agreement
                  </CardTitle>
                  <CardDescription>
                    Our legally sound rental agreement template covers all essential terms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Term of tenancy (fixed-term or month-to-month)</li>
                    <li>Rent amount, due date, and payment methods</li>
                    <li>Security deposit and refund conditions</li>
                    <li>Maintenance responsibilities</li>
                    <li>Rules and regulations</li>
                    <li>Termination conditions</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline" className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    Legal Compliant
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    24-48 hr processing
                  </Badge>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Our Process
                  </CardTitle>
                  <CardDescription>
                    Simple, efficient, and transparent process for all parties.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Consultation:</span> 
                      <span>Discuss specific requirements with our legal experts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Document Preparation:</span> 
                      <span>Our team drafts the agreement with required terms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Review:</span> 
                      <span>Both parties review and propose modifications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Finalization:</span> 
                      <span>Agreement finalized and signed by all parties</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="owner" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>For Property Owners</CardTitle>
                <CardDescription>
                  Protect your property investment with our comprehensive rental agreement services for landlords.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Benefits for Owners</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Legal protection with clear terms and conditions</li>
                    <li>Detailed payment terms and deposit management</li>
                    <li>Property maintenance responsibilities clearly defined</li>
                    <li>Breach of contract and eviction procedures</li>
                    <li>Rules and regulations for property use</li>
                    <li>Insurance and liability requirements</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Documentation Provided</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border rounded-md">
                      <Download className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Comprehensive Rental Agreement</p>
                        <p className="text-sm text-muted-foreground">Complete legally binding document</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <Download className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Property Condition Report</p>
                        <p className="text-sm text-muted-foreground">Document pre-existing conditions</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <Download className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Payment Schedule Template</p>
                        <p className="text-sm text-muted-foreground">Track rent payments efficiently</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <Download className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Notice Templates</p>
                        <p className="text-sm text-muted-foreground">For various communications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => document.querySelector('[data-value="request"]')?.click()}>
                  Request Owner Agreement Service
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="tenant" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>For Tenants</CardTitle>
                <CardDescription>
                  Ensure your rights are protected with clearly defined terms and conditions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Benefits for Tenants</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Clear understanding of rights and responsibilities</li>
                    <li>Protection against unauthorized rent increases</li>
                    <li>Well-defined property maintenance responsibilities</li>
                    <li>Privacy protection and entry notification requirements</li>
                    <li>Security deposit handling and return conditions</li>
                    <li>Lease renewal and termination procedures</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Our Tenant Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border rounded-md">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Agreement Review</p>
                        <p className="text-sm text-muted-foreground">Expert analysis of your lease terms</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Negotiation Assistance</p>
                        <p className="text-sm text-muted-foreground">Help with requesting fair terms</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Document Explanation</p>
                        <p className="text-sm text-muted-foreground">Clear explanation of legal terms</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">Move-in/Move-out Support</p>
                        <p className="text-sm text-muted-foreground">Property condition verification</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => document.querySelector('[data-value="request"]')?.click()}>
                  Request Tenant Agreement Service
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="request" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Rental Agreement Service</CardTitle>
                <CardDescription>
                  Fill out the form below to request our rental agreement services. Our team will contact you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userType">I am a</Label>
                      <select id="userType" className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option value="">Select your role</option>
                        <option value="owner">Property Owner</option>
                        <option value="tenant">Tenant</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Property Address</Label>
                      <Input id="address" placeholder="Enter property address" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="message">Additional Requirements</Label>
                      <Textarea id="message" placeholder="Enter any special requirements or questions" rows={4} />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestAgreement}>
                  Submit Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}