import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Percent, PiggyBank, ShoppingCart } from 'lucide-react';

interface SalePricingNoticeProps {
  salePrice?: number;
  platformFeePercent: number;
  buyerMarkupPercent: number;
}

const formatCurrency = (value: number) =>
  `ZMW ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalePricingNotice = ({
  salePrice = 0,
  platformFeePercent,
  buyerMarkupPercent,
}: SalePricingNoticeProps) => {
  const buyerMarkup = salePrice * (buyerMarkupPercent / 100);
  const platformFee = salePrice * (platformFeePercent / 100);
  const buyerTotal = salePrice + buyerMarkup;
  const sellerEarnings = Math.max(salePrice - platformFee, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Sale Pricing Breakdown
        </CardTitle>
        <CardDescription>
          We transparently show how the 5% buyer markup and 10% platform fee affect this sale price in real time.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 bg-slate-50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Buyer markup ({buyerMarkupPercent}%)</span>
            <Badge variant="secondary" className="text-xs">
              +{buyerMarkupPercent}%
            </Badge>
          </div>
          <p className="text-lg font-semibold mt-2">{formatCurrency(buyerMarkup)}</p>
          <p className="text-xs text-muted-foreground">
            Added on top of your price. Buyers see {formatCurrency(buyerTotal)} total.
          </p>
        </div>

        <div className="rounded-lg border p-4 bg-emerald-50">
          <div className="flex items-center justify-between text-sm text-emerald-700">
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              Buyer total
            </span>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-white">
              {formatCurrency(buyerTotal)}
            </Badge>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Your set price</span>
            <span>{formatCurrency(salePrice)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Markup added</span>
            <span>{formatCurrency(buyerMarkup)}</span>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-amber-50">
          <div className="flex items-center justify-between text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <PiggyBank className="h-4 w-4" />
              Your earnings after 10%
            </span>
            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-white">
              -{platformFeePercent}%
            </Badge>
          </div>
          <p className="text-lg font-semibold mt-2 text-amber-800">{formatCurrency(sellerEarnings)}</p>
          <p className="text-xs text-muted-foreground">
            We deduct {formatCurrency(platformFee)} (10%) for the platform. You keep {formatCurrency(sellerEarnings)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalePricingNotice;
