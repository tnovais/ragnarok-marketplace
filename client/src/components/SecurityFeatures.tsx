import { Card, CardContent } from "@/components/ui/card";
import { Shield, Gavel, CreditCard, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { FEE_RATES } from "@/lib/constants";

export default function SecurityFeatures() {
  return (
    <section className="py-16 bg-ro-dark text-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medieval font-bold mb-4">
            <Shield className="inline mr-2 h-8 w-8 text-ro-gold" />
            Segurança Total Garantida
          </h2>
          <p className="text-ro-cream text-lg">Proteção completa para suas transações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-ro-dark h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sistema de Custódia</h3>
            <p className="text-ro-cream">
              Dinheiro protegido até confirmação da entrega. Sem riscos para compradores.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="text-ro-dark h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sistema de Disputas</h3>
            <p className="text-ro-cream">
              Moderação profissional em até 72h. Resolução justa e imparcial.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-ro-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-ro-dark h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pagamento via PIX</h3>
            <p className="text-ro-cream">
              Transferências instantâneas e seguras. Sem intermediários bancários.
            </p>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-ro-brown rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Estrutura de Taxas Transparente</h3>
              <p className="text-ro-cream">Sem surpresas, sem taxas ocultas</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
              <Card>
                <CardContent className="p-4 text-center text-ro-dark">
                  <div className="font-bold text-lg">{(FEE_RATES.STANDARD_LOW * 100).toFixed(0)}%</div>
                  <div className="text-sm">Até R$ {FEE_RATES.THRESHOLD}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center text-ro-dark">
                  <div className="font-bold text-lg">{(FEE_RATES.STANDARD_HIGH * 100).toFixed(0)}%</div>
                  <div className="text-sm">Acima de R$ {FEE_RATES.THRESHOLD}</div>
                </CardContent>
              </Card>
              <Card className="bg-ro-gold">
                <CardContent className="p-4 text-center text-ro-dark">
                  <div className="font-bold text-lg">{(FEE_RATES.PROMOTED * 100).toFixed(0)}%</div>
                  <div className="text-sm">Anúncios Promovidos</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-ro-gold border-opacity-30">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-ro-gold" />
                Como Funciona a Proteção
              </h4>
              <ul className="space-y-2 text-ro-cream text-sm">
                <li>• Comprador paga via PIX para a plataforma</li>
                <li>• Dinheiro fica em custódia segura</li>
                <li>• Vendedor entrega o item no jogo</li>
                <li>• Ambas partes confirmam a transação</li>
                <li>• Dinheiro é liberado para o vendedor</li>
                <li>• 7 dias para abertura de disputas</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-ro-gold" />
                Proteções Adicionais
              </h4>
              <ul className="space-y-2 text-ro-cream text-sm">
                <li>• Verificação de identidade dos usuários</li>
                <li>• Sistema de reputação baseado em avaliações</li>
                <li>• Histórico completo de transações</li>
                <li>• Suporte especializado 24/7</li>
                <li>• Reembolso garantido em casos de fraude</li>
                <li>• Criptografia de dados bancários</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-ro-cream text-lg mb-6">
            Junte-se a milhares de jogadores que já confiam no RagnaTrade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Card className="bg-ro-gold text-ro-dark">
              <CardContent className="p-4 text-center">
                <div className="font-bold text-2xl">100%</div>
                <div className="text-sm">Transações Seguras</div>
              </CardContent>
            </Card>
            <Card className="bg-ro-gold text-ro-dark">
              <CardContent className="p-4 text-center">
                <div className="font-bold text-2xl">72h</div>
                <div className="text-sm">Resolução Disputas</div>
              </CardContent>
            </Card>
            <Card className="bg-ro-gold text-ro-dark">
              <CardContent className="p-4 text-center">
                <div className="font-bold text-2xl">24/7</div>
                <div className="text-sm">Suporte Online</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
