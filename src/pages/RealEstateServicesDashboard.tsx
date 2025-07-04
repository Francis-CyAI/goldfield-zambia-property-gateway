
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  ShoppingCart, 
  DollarSign, 
  Home, 
  Globe, 
  Users, 
  MapPin, 
  Calendar,
  FileCheck,
  Video,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RealEstateServicesDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app this would come from API
  const stats = {
    totalListings: 245,
    activeSales: 18,
    rentalProperties: 67,
    diasporaClients: 34,
    completedTransactions: 156,
    virtualTours: 89,
    legalDocuments: 203,
    monthlyRevenue: 85000
  };

  const salesTransactions = [
    { id: 1, property: 'Villa in Kabulonga', client: 'John Banda', status: 'contract_signed', value: 450000 },
    { id: 2, property: 'Apartment Downtown', client: 'Sarah Mwansa', status: 'valuation', value: 180000 },
    { id: 3, property: 'Farm in Mkushi', client: 'David Phiri', status: 'negotiation', value: 320000 },
  ];

  const rentalProperties = [
    { id: 1, property: 'Modern Flat - Cairo Road', tenant: 'Alice Tembo', rent: 3500, status: 'occupied' },
    { id: 2, property: 'House - Olympia', tenant: 'Peter Zulu', rent: 2800, status: 'available' },
    { id: 3, property: 'Studio - Woodlands', tenant: 'Grace Banda', rent: 1500, status: 'maintenance' },
  ];

  const diasporaClients = [
    { id: 1, name: 'Michael Simukonda', location: 'South Africa', service: 'Property Purchase', status: 'active' },
    { id: 2, name: 'Ruth Kalaba', location: 'UK', service: 'Investment Consultation', status: 'completed' },
    { id: 3, name: 'Joseph Mulenga', location: 'Canada', service: 'Virtual Tour', status: 'scheduled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'occupied':
      case 'completed':
      case 'contract_signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'available':
      case 'valuation':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const propertyTypes = [
    { name: 'Residential', count: 156, icon: Home },
    { name: 'Commercial', count: 45, icon: Building2 },
    { name: 'Farmland', count: 34, icon: MapPin },
    { name: 'Plots', count: 67, icon: MapPin },
  ];

  const cities = [
    { name: 'Lusaka', properties: 120, sales: 15, rentals: 45 },
    { name: 'Ndola', properties: 56, sales: 8, rentals: 18 },
    { name: 'Kitwe', properties: 34, sales: 5, rentals: 12 },
    { name: 'Livingstone', properties: 23, sales: 3, rentals: 8 },
    { name: 'Kabwe', properties: 12, sales: 2, rentals: 4 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real Estate Services Dashboard</h1>
          <p className="text-gray-600">Comprehensive property sales, rentals, and diaspora services management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs text-gray-600">Total Listings</p>
                  <p className="text-lg font-bold">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Active Sales</p>
                  <p className="text-lg font-bold">{stats.activeSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Rentals</p>
                  <p className="text-lg font-bold">{stats.rentalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Diaspora</p>
                  <p className="text-lg font-bold">{stats.diasporaClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-lg font-bold">{stats.completedTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Virtual Tours</p>
                  <p className="text-lg font-bold">{stats.virtualTours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-600">Legal Docs</p>
                  <p className="text-lg font-bold">{stats.legalDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Banknote className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Revenue</p>
                  <p className="text-lg font-bold">K{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="diaspora">Diaspora</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyTypes.map((type) => (
                      <div key={type.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{type.name}</span>
                        </div>
                        <Badge variant="secondary">{type.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cities Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Cities Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cities.map((city) => (
                      <div key={city.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{city.name}</span>
                          <span className="text-xs text-gray-500">{city.properties} properties</span>
                        </div>
                        <div className="flex space-x-2 text-xs">
                          <span className="text-green-600">{city.sales} sales</span>
                          <span className="text-blue-600">{city.rentals} rentals</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/list-property">
                    <Button className="w-full" variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      Add New Listing
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Virtual Tour
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Legal Documentation
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Diaspora Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Active Sales Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{transaction.property}</h4>
                        <p className="text-sm text-gray-600">Client: {transaction.client}</p>
                        <p className="text-sm font-medium text-green-600">K{transaction.value.toLocaleString()}</p>
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Rental Properties Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rentalProperties.map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rental.property}</h4>
                        <p className="text-sm text-gray-600">Tenant: {rental.tenant}</p>
                        <p className="text-sm font-medium text-blue-600">K{rental.rent}/month</p>
                      </div>
                      <Badge className={getStatusColor(rental.status)}>
                        {rental.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diaspora" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Diaspora Clients</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diasporaClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-gray-600">{client.location}</p>
                          <p className="text-xs text-gray-500">{client.service}</p>
                        </div>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diaspora Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Virtual Tours</h4>
                    <p className="text-sm text-blue-600">Remote property viewing via video calls</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Foreign Currency</h4>
                    <p className="text-sm text-green-600">Accept USD, GBP, EUR payments</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Remote Management</h4>
                    <p className="text-sm text-purple-600">Property management while abroad</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Investment Consultation</h4>
                    <p className="text-sm text-yellow-600">Expert advice on property investments</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileCheck className="h-5 w-5" />
                    <span>Legal Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Title Verification</span>
                      <Badge className="bg-green-100 text-green-800">95% Complete</Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Documentation</span>
                      <Badge className="bg-blue-100 text-blue-800">89% Complete</Badge>
                    </div>
                    <Progress value={89} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Legal Reviews</span>
                      <Badge className="bg-yellow-100 text-yellow-800">78% Complete</Badge>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Title Deeds</span>
                      <span className="text-sm font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sale Agreements</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lease Agreements</span>
                      <span className="text-sm font-medium">67</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Valuation Reports</span>
                      <span className="text-sm font-medium">134</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Sales Target</span>
                        <span className="text-sm">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Rental Occupancy</span>
                        <span className="text-sm">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Client Satisfaction</span>
                        <span className="text-sm">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Property Sales</span>
                      <span className="text-sm font-medium">K45,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rental Management</span>
                      <span className="text-sm font-medium">K28,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Diaspora Services</span>
                      <span className="text-sm font-medium">K12,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. Sale Time</span>
                      <span className="text-sm font-medium">45 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Property Views</span>
                      <span className="text-sm font-medium">1,234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm font-medium">12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealEstateServicesDashboard;
