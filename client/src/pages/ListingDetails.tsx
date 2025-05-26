import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import TransactionModal from "@/components/TransactionModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Star, Shield, MapPin, Tag, Calendar, Crown } from "lucide-react";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/listings/${id}/reviews`],
    enabled: !!id,
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/transactions", {
        listingId: id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      toast({
        title: "Compra realizada com sucesso!",
        description: "Aguarde a entrega do vendedor para confirmar a transação.",
      });
      setShowTransactionModal(true);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na compra",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ro-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-1/3 mb-6 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-300 h-64 rounded-lg mb-6"></div>
                <div className="bg-gray-300 h-32 rounded-lg"></div>
              </div>
              <div>
                <div className="bg-gray-300 h-48 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-ro-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Anúncio não encontrado</h1>
            <p className="text-gray-600">O item que você está procurando não existe ou foi removido.</p>
          </div>
        </div>
      </div>
    );
  }

  const price = parseFloat(listing.price);
  const isOwner = user?.id === listing.sellerId;
  const canBuy = user && !isOwner && !listing.isSold;

  // Calculate fees for display
  const baseFeeRate = price >= 200 ? 0.10 : 0.15;
  const finalFeeRate = listing.isPromoted ? 0.06 : baseFeeRate;
  const fee = price * finalFeeRate;

  return (
    <div className="min-h-screen bg-ro-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Marketplace</span>
            <span>/</span>
            <span>{listing.server?.name}</span>
            <span>/</span>
            <span>{listing.category?.name}</span>
            <span>/</span>
            <span className="text-ro-brown font-medium">{listing.itemName}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {listing.isOfficial && (
                  <Badge className="bg-ro-gold text-ro-dark">
                    <Shield className="h-3 w-3 mr-1" />
                    OFICIAL
                  </Badge>
                )}
                {listing.isPromoted && (
                  <Badge className="bg-green-500">
                    <Crown className="h-3 w-3 mr-1" />
                    PROMOVIDO
                  </Badge>
                )}
                {listing.isSold && (
                  <Badge variant="secondary">VENDIDO</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-ro-dark mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.server?.name}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>{listing.category?.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(listing.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Screenshots */}
            {listing.screenshots && listing.screenshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Capturas de Tela</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.screenshots.map((screenshot: string, index: number) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(screenshot, '_blank')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{listing.description}</div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações do Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.reviewer?.profileImageUrl} />
                            <AvatarFallback>
                              {review.reviewer?.firstName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {review.reviewer?.firstName || 'Usuário'}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 mt-1">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma avaliação ainda.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ro-brown mb-2">
                    R$ {price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Taxa: R$ {fee.toFixed(2)} ({(finalFeeRate * 100).toFixed(0)}%)
                    {listing.isPromoted && " - Anúncio Promovido"}
                  </div>
                </div>

                <Separator />

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Item:</span>
                    <span className="font-medium">{listing.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servidor:</span>
                    <span>{listing.server?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categoria:</span>
                    <span>{listing.category?.name}</span>
                  </div>
                </div>

                <Separator />

                {canBuy ? (
                  <Button 
                    className="w-full bg-ro-brown hover:bg-ro-dark"
                    onClick={() => buyMutation.mutate()}
                    disabled={buyMutation.isPending}
                  >
                    {buyMutation.isPending ? "Processando..." : "Comprar Agora"}
                  </Button>
                ) : listing.isSold ? (
                  <Button disabled className="w-full">
                    Item Vendido
                  </Button>
                ) : isOwner ? (
                  <Button disabled className="w-full">
                    Seu Anúncio
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Faça Login para Comprar
                  </Button>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Pagamento via PIX</p>
                  <p>• Dinheiro protegido em custódia</p>
                  <p>• Liberação após confirmação</p>
                  <p>• Sistema de disputas</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={listing.seller?.profileImageUrl} />
                    <AvatarFallback>
                      {listing.seller?.firstName?.[0] || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {listing.seller?.firstName 
                        ? `${listing.seller.firstName} ${listing.seller.lastName || ''}`.trim()
                        : 'Vendedor'
                      }
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{listing.seller?.reputation || '5.00'}</span>
                      <span className="mx-1">•</span>
                      <span>{listing.seller?.totalSales || 0} vendas</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Membro desde {new Date(listing.seller?.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-ro-gold" />
                  Proteção RagnaTrade
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>✓ Pagamento protegido em custódia</p>
                <p>✓ Confirme antes da liberação</p>
                <p>✓ Sistema de disputas em 7 dias</p>
                <p>✓ Suporte 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showTransactionModal && (
        <TransactionModal
          open={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          listing={listing}
        />
      )}
    </div>
  );
}
