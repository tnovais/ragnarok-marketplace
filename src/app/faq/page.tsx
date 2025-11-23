// FAQ Page
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Central de Ajuda & Regras</h1>

            <div className="grid gap-8">
                {/* Taxas de Serviço */}
                <Card>
                    <CardHeader>
                        <CardTitle>Taxas de Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">Vendas Padrão</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li><span className="font-bold text-foreground">10%</span> para vendas ≥ R$ 200,00</li>
                                    <li><span className="font-bold text-foreground">15%</span> para vendas &lt; R$ 200,00</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <h3 className="font-semibold mb-2 text-primary">Anúncios Premium</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Taxa fixa de <span className="font-bold text-foreground">6%</span> sobre a venda</li>
                                    <li>Custo de adesão: <span className="font-bold text-foreground">R$ 20,00</span> (mensal)</li>
                                    <li>Destaque na home e buscas</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prazos e Saques */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prazos e Saques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Liberação de Saldo</h3>
                            <p className="text-sm text-muted-foreground">
                                O valor da venda é liberado na sua carteira <span className="font-bold text-foreground">72 horas úteis</span> após a confirmação de entrega e o fim do prazo de disputa (7 dias).
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Saques</h3>
                            <p className="text-sm text-muted-foreground">
                                Os saques são realizados via PIX.
                            </p>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-4 py-3 rounded-md text-sm">
                                ⚠️ Saques para chaves PIX que não sejam o CPF do titular são processados manualmente e podem levar mais tempo para serem concluídos.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Perguntas Frequentes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perguntas Frequentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Como funciona o sistema de custódia?</AccordionTrigger>
                                <AccordionContent>
                                    Para garantir a segurança de ambas as partes, o pagamento do comprador fica retido em nossa plataforma até que o item seja entregue e confirmado. Somente após a confirmação (e o prazo de garantia), o valor é liberado para o vendedor.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Como abro uma disputa?</AccordionTrigger>
                                <AccordionContent>
                                    Se houver algum problema com a transação, você tem até <span className="font-bold">7 dias</span> após a compra para abrir uma disputa. Nossa equipe de moderação analisará as evidências (prints, vídeos) e decidirá o caso em até 72 horas.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>É seguro vender contas?</AccordionTrigger>
                                <AccordionContent>
                                    Sim, mas exigimos que o vendedor forneça todos os dados de recuperação. Recomendamos que o comprador altere todas as senhas e e-mails de recuperação imediatamente após o recebimento.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Quais servidores são aceitos?</AccordionTrigger>
                                <AccordionContent>
                                    Atualmente aceitamos comércio nos servidores bRO (Thor, Valhalla) e iRO (Freya, Nidhogg, Yggdrasil).
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
