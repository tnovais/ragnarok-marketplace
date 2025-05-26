import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Shield, MapPin, Tag } from "lucide-react";
import { FEE_RATES, PLACEHOLDER_IMAGES } from "@/lib/constants";

interface ItemCardProps {
  listing: {
    id: string;
    title: string;
    price: string;
    itemName: string;
    isPromoted?: boolean;
    isOfficial?: boolean;
    isSold?: boolean;
    screenshots?: string[];
    createdAt: string;
    seller: {
      firstName?: string;
      lastName?: string;
      reputation?: string;
      totalSales?: number;
    };
    server: {
      name: string;
    };
    category: {
      name: string;
    };
  };
}

export default function ItemCard({ listing }: ItemCardProps) {
  const price = parseFloat(listing.price);
  const feeRate = listing.isPromoted ? FEE_RATES.PROMOTED : 
                  (price >= FEE_RATES.THRESHOLD ? FEE_RATES.STANDARD_HIGH : FEE_RATES.STANDARD_LOW);
  const fee = price * feeRate;

  // Get appropriate placeholder image based on category
  const getPlaceholderImage = (categoryName: string) => {
    if (categoryName.toLowerCase().includes('zeny')) return PLACEHOLDER_IMAGES.GOLD;
    if (categoryName.toLowerCase().includes('arma')) return PLACEHOLDER_IMAGES.WEAPON;
    if (categoryName.toLowerCase().includes('armadura')) return PLACEHOLDER_IMAGES.ARMOR;
    if (categoryName.toLowerCase().includes('acessório')) return PLACEHOLDER_IMAGES.ACCESSORY;
    return PLACEHOLDER_IMAGES.ITEM;
  };

  const imageUrl = listing.screenshots?.[0] || getPlaceholderImage(listing.category.name);
  const sellerName = listing.seller.firstName 
    ? `${listing.seller.firstName} ${listing.seller.lastName || ''}`.trim()
    : 'Vendedor';
  const reputation = parseFloat(listing.seller.reputation || '5.0');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 group overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl}
          alt={listing.itemName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGES.ITEM;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {listing.isOfficial && (
            <Badge className="bg-ro-gold text-ro-dark text-xs">
              <Shield className="h-3 w-3 mr-1" />
              OFICIAL
            </Badge>
          )}
          {listing.isPromoted && (
            <Badge className="bg-green-500 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              PROMOVIDO
            </Badge>
          )}
          {listing.isSold && (
            <Badge variant="secondary" className="text-xs">
              VENDIDO
            </Badge>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button asChild size="sm" className="bg-white text-ro-dark hover:bg-ro-cream">
            <Link href={`/listing/${listing.id}`}>
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-ro-brown transition-colors">
          <Link href={`/listing/${listing.id}`} className="hover:underline">
            {listing.title}
          </Link>
        </h3>

        {/* Item details */}
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-3">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{listing.server.name}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            <span>{listing.category.name}</span>
          </div>
        </div>

        {/* Seller info */}
        <div className="flex items-center mb-3">
          <div className="flex items-center flex-1">
            <div className="w-6 h-6 bg-ro-brown rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">
                {sellerName[0]?.toUpperCase()}
              </span>
            </div>
            <div className="text-xs">
              <div className="font-medium text-gray-900">{sellerName}</div>
              <div className="flex items-center text-gray-600">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span>{reputation.toFixed(1)}</span>
                <span className="mx-1">•</span>
                <span>{listing.seller.totalSales || 0} vendas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-ro-brown">
              R$ {price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Taxa: R$ {fee.toFixed(2)} ({(feeRate * 100).toFixed(0)}%)
              {listing.isPromoted && " - Promovido"}
            </div>
          </div>
          
          <Button 
            asChild 
            size="sm" 
            className="bg-ro-brown hover:bg-ro-dark"
            disabled={listing.isSold}
          >
            <Link href={`/listing/${listing.id}`}>
              {listing.isSold ? "Vendido" : "Comprar"}
            </Link>
          </Button>
        </div>

        {/* Posted date */}
        <div className="text-xs text-gray-500 mt-2">
          Publicado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
