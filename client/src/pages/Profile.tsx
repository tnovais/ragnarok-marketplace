import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Wallet, Star, ShoppingBag, Store, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();

  const { data: userListings = [] } = useQuery({
    queryKey: ['/api/user/listings'],
  });

  const { data: userTransactions = [] } = useQuery({
    queryKey: ['/api/user/transactions'],
  });

  const { data: userWithdrawals = [] } = useQuery({
    queryKey: ['/api/user/withdrawals'],
  });

  const walletBalance = parseFloat(user?.walletBalance || "0");

  return (
    <div className="min-h-screen bg-ro-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-ro-brown rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ro-dark">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{user?.reputation || '5.00'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {user?.totalSales || 0} vendas • {user?.totalPurchases || 0} compras
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Saldo da Carteira</div>
              <div className="text-2xl font-bold text-ro-brown">
                R$ {walletBalance.toFixed(2)}
              </div>
              <Button 
                size="sm" 
                className="mt-2 bg-ro-gold hover:bg-yellow-500 text-ro-dark"
                disabled={walletBalance === 0}
              >
                <Wallet className="h-4 w-4 mr-1" />
                Sacar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">
              <Store className="h-4 w-4 mr-2" />
              Meus Anúncios
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <Wallet className="h-4 w-4 mr-2" />
              Saques
            </TabsTrigger>
            <TabsTrigger value="settings">
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-ro-dark">Meus Anúncios</h2>
              <Button asChild className="bg-ro-brown hover:bg-ro-dark">
                <Link href="/create-listing">
                  <Store className="h-4 w-4 mr-2" />
                  Criar Anúncio
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing: any) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <Badge variant={listing.isSold ? "secondary" : "default"}>
                        {listing.isSold ? "Vendido" : "Ativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {listing.server?.name} • {listing.category?.name}
                    </p>
                    <p className="text-xl font-bold text-ro-brown">
                      R$ {parseFloat(listing.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userListings.length === 0 && (
              <div className="text-center py-12">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não criou nenhum anúncio.</p>
                <Button asChild className="mt-4 bg-ro-brown hover:bg-ro-dark">
                  <Link href="/create-listing">Criar Primeiro Anúncio</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <h2 className="text-xl font-semibold text-ro-dark mb-6">Minhas Transações</h2>
            
            <div className="space-y-4">
              {userTransactions.map((transaction: any) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{transaction.listing?.title}</h3>
                        <p className="text-sm text-gray-600">
                          {transaction.buyerId === user?.id ? 'Compra' : 'Venda'} • 
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-ro-brown">
                          R$ {parseFloat(transaction.amount).toFixed(2)}
                        </p>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'disputed' ? 'destructive' :
                          'secondary'
                        }>
                          {transaction.status === 'completed' ? 'Concluída' :
                           transaction.status === 'disputed' ? 'Em Disputa' :
                           transaction.status === 'delivered' ? 'Entregue' :
                           'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userTransactions.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não tem transações.</p>
              </div>
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <h2 className="text-xl font-semibold text-ro-dark mb-6">Histórico de Saques</h2>
            
            <div className="space-y-4">
              {userWithdrawals.map((withdrawal: any) => (
                <Card key={withdrawal.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">R$ {parseFloat(withdrawal.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">PIX: {withdrawal.pixKey}</p>
                      </div>
                      <Badge variant={
                        withdrawal.status === 'completed' ? 'default' :
                        withdrawal.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {withdrawal.status === 'completed' ? 'Processado' :
                         withdrawal.status === 'failed' ? 'Falhou' :
                         'Pendente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userWithdrawals.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não fez nenhum saque.</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                  <p className="text-sm text-gray-600">
                    As informações da sua conta são gerenciadas pelo sistema de autenticação.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    asChild
                  >
                    <a href="/api/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da Conta
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
