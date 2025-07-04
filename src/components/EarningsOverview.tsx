
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const EarningsOverview = () => {
  // Mock data for demonstration
  const monthlyEarnings = [
    { month: 'Jan', kwacha: 12500, usd: 605, bookings: 8 },
    { month: 'Feb', kwacha: 15800, usd: 764, bookings: 12 },
    { month: 'Mar', kwacha: 18200, usd: 880, bookings: 15 },
    { month: 'Apr', kwacha: 14600, usd: 706, bookings: 10 },
    { month: 'May', kwacha: 22400, usd: 1083, bookings: 18 },
    { month: 'Jun', kwacha: 19800, usd: 957, bookings: 16 }
  ];

  const propertyPerformance = [
    { property: 'Modern Apartment', earnings: 45600, bookings: 24, occupancy: 85 },
    { property: 'Cozy Studio', earnings: 32400, bookings: 18, occupancy: 72 },
    { property: 'Villa with Pool', earnings: 67200, bookings: 12, occupancy: 92 }
  ];

  const currentMonth = {
    totalEarnings: 22400,
    totalBookings: 18,
    occupancyRate: 78,
    averageRate: 1244
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Earnings Overview</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 6 Months
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{currentMonth.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonth.totalBookings}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonth.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{currentMonth.averageRate}</div>
            <p className="text-xs text-muted-foreground">Per night</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings Trend</CardTitle>
            <CardDescription>
              Your earnings in Zambian Kwacha over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`K${value.toLocaleString()}`, 'Earnings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="kwacha" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings</CardTitle>
            <CardDescription>
              Number of bookings received each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
          <CardDescription>
            Earnings and occupancy rates for each of your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {propertyPerformance.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-12 bg-primary rounded-full"></div>
                  <div>
                    <h4 className="font-medium">{property.property}</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.bookings} bookings this month
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-semibold">K{property.earnings.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total earnings</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{property.occupancy}%</div>
                    <div className="text-sm text-muted-foreground">Occupancy</div>
                  </div>
                  <Badge variant={property.occupancy > 80 ? "default" : "secondary"}>
                    {property.occupancy > 80 ? "High" : "Medium"} Performance
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsOverview;
