
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListProperty = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold luxury-text-gradient">List your property</h1>
        <p className="text-muted-foreground">
          Choose if you are renting out a stay or selling a property. We will guide you through the right form.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-primary/30">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              For Rent
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5" />
              Rental listing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Perfect for short or long-term stays. Set your nightly rate and amenities, and start accepting bookings.
            </p>
            <Link to="/list-property/rent">
              <Button className="w-full justify-between">
                Start rental form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-amber-300/60">
          <CardHeader className="space-y-3">
            <Badge className="bg-amber-500 text-white w-fit">For Sale</Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Home className="h-5 w-5" />
              Property sale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sell your property with transparent fees. Upload ownership docs and ID; buyers submit requests and we close
              offline.
            </p>
            <Link to="/list-property/sale">
              <Button className="w-full justify-between" variant="outline">
                Start sale form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListProperty;
