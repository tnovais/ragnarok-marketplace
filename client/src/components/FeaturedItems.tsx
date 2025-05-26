import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Crown, Shield, Star } from "lucide-react";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export default function FeaturedItems() {
  const { data: featuredListings = [], isLoading } = useQuery({
    queryKey: ['/api/listings', { isOfficial: true, limit: 4 }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('isOfficial', 'true');
      return fetch(`/api/listings?${params}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medieval font-bold text-ro-dark mb-4">
              <Star className="inline mr-2 h-8 w-8 text-ro-gold" />
              Itens em Destaque
            </h2>
            <p className="text-gray-600 text-lg">Vendas diretas do RagnaTrade - Entrega garantida</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hide section completely if no official items from the site
  if (!isLoading && featuredListings.length === 0) {
    return null;
  }

  const displayItems = featuredListings.slice(0, 4);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medieval font-bold text-ro-dark mb-4">
            <Star className="inline mr-2 h-8 w-8 text-ro-gold" />
            Itens em Destaque
          </h2>
          <p className="text-gray-600 text-lg">Vendas diretas do RagnaTrade - Entrega garantida</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayItems.map((item: any) => (
            <div key={item.id} className="bg-gradient-to-br from-ro-gold to-yellow-500 rounded-lg p-1">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-ro-gold text-ro-dark text-xs font-bold">
                      OFICIAL
                    </Badge>
                    <Shield className="text-ro-gold h-5 w-5" />
                  </div>
                  
                  <img 
                    src={item.screenshots?.[0] || PLACEHOLDER_IMAGES.ITEM}
                    alt={item.itemName}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGES.ITEM;
                    }}
                  />
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">Servidor: {item.server.name}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-ro-brown">
                      R$ {parseFloat(item.price).toFixed(2)}
                    </span>
                    <Button 
                      asChild
                      size="sm"
                      className="bg-ro-brown hover:bg-ro-dark text-white"
                    >
                      <Link href={featuredListings.length > 0 ? `/listing/${item.id}` : "#"}>
                        Comprar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {featuredListings.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              Itens oficiais estarão disponíveis em breve!
            </p>
            <Button asChild className="bg-ro-brown hover:bg-ro-dark">
              <Link href="/create-listing">
                Seja o primeiro a vender
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
