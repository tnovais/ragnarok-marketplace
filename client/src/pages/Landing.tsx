import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, Gavel, CreditCard, ShoppingCart, Store } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ro-light">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-ro-gold sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-ro-brown to-ro-dark rounded-lg flex items-center justify-center">
                <Crown className="text-ro-gold h-6 w-6" />
              </div>
              <span className="text-2xl font-medieval font-semibold text-ro-dark">RagnaTrade</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/api/login">Fazer Login</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ro-dark via-ro-brown to-ro-dark text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-ro-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-medieval font-bold mb-6">
              Marketplace Oficial de <span className="text-ro-gold">Ragnarok Online</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-ro-cream">
              Compre e venda itens, equipamentos e zenys com segurança total
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-ro-gold hover:bg-yellow-500 text-ro-dark font-semibold"
                asChild
              >
                <a href="/api/login">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Começar a Comprar
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-ro-gold text-ro-gold hover:bg-ro-gold hover:text-ro-dark"
                asChild
              >
                <a href="/api/login">
                  <Store className="mr-2 h-5 w-5" />
                  Criar Anúncio
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-ro-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medieval font-bold mb-4">
              <Shield className="inline mr-2 h-8 w-8 text-ro-gold" />
              Segurança Total Garantida
            </h2>
            <p className="text-ro-cream text-lg">Proteção completa para suas transações</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-ro-dark h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sistema de Custódia</h3>
              <p className="text-ro-cream">Dinheiro protegido até confirmação da entrega</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="text-ro-dark h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sistema de Disputas</h3>
              <p className="text-ro-cream">Moderação profissional em até 72h</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-ro-dark h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pagamento via PIX</h3>
              <p className="text-ro-cream">Transferências instantâneas e seguras</p>
            </div>
          </div>

          <div className="mt-12 bg-ro-brown rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Estrutura de Taxas Transparente</h3>
                <p className="text-ro-cream">Sem surpresas, sem taxas ocultas</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                <Card>
                  <CardContent className="p-4 text-center text-ro-dark">
                    <div className="font-bold text-lg">15%</div>
                    <div className="text-sm">Até R$ 200</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center text-ro-dark">
                    <div className="font-bold text-lg">10%</div>
                    <div className="text-sm">Acima de R$ 200</div>
                  </CardContent>
                </Card>
                <Card className="bg-ro-gold">
                  <CardContent className="p-4 text-center text-ro-dark">
                    <div className="font-bold text-lg">6%</div>
                    <div className="text-sm">Anúncios Promovidos</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medieval font-bold text-ro-dark mb-8">Comece Agora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-ro-cream to-white border-2 border-ro-gold">
              <CardContent className="p-8">
                <ShoppingCart className="h-12 w-12 text-ro-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ro-dark mb-4">Quero Comprar</h3>
                <p className="text-gray-600 mb-6">Encontre os melhores itens com segurança total</p>
                <Button 
                  className="bg-ro-brown hover:bg-ro-dark text-white"
                  asChild
                >
                  <a href="/api/login">Explorar Itens</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ro-cream to-white border-2 border-ro-gold">
              <CardContent className="p-8">
                <Store className="h-12 w-12 text-ro-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ro-dark mb-4">Quero Vender</h3>
                <p className="text-gray-600 mb-6">Venda seus itens com proteção total</p>
                <Button 
                  className="bg-ro-gold hover:bg-yellow-500 text-ro-dark"
                  asChild
                >
                  <a href="/api/login">Criar Anúncio</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ro-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-ro-gold rounded-lg flex items-center justify-center">
                <Crown className="text-ro-dark h-5 w-5" />
              </div>
              <span className="text-xl font-medieval font-semibold">RagnaTrade</span>
            </div>
            <p className="text-ro-cream text-sm mb-8">O marketplace mais seguro para Ragnarok Online</p>
            
            <div className="border-t border-ro-brown pt-8">
              <p className="text-ro-cream text-sm">
                © 2024 RagnaTrade. Todos os direitos reservados. 
                <span className="text-ro-gold"> Ragnarok Online</span> é marca registrada da Gravity Co., Ltd.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
