import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Gavel, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resolutionTexts, setResolutionTexts] = useState<Record<string, string>>({});

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['/api/disputes'],
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, resolution, status }: {
      disputeId: string;
      resolution: string;
      status: 'resolved';
    }) => {
      const response = await apiRequest("PATCH", `/api/disputes/${disputeId}`, {
        resolution,
        status,
        resolvedAt: new Date(),
        resolvedBy: 'Admin', // In a real app, this would be the current admin user
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      toast({
        title: "Disputa resolvida",
        description: "A decisão foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resolver disputa",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleResolveDispute = (disputeId: string) => {
    const resolution = resolutionTexts[disputeId];
    if (!resolution?.trim()) {
      toast({
        title: "Resolução obrigatória",
        description: "Digite uma resolução antes de finalizar a disputa.",
        variant: "destructive",
      });
      return;
    }

    resolveDisputeMutation.mutate({
      disputeId,
      resolution: resolution.trim(),
      status: 'resolved',
    });
  };

  const updateResolutionText = (disputeId: string, text: string) => {
    setResolutionTexts(prev => ({
      ...prev,
      [disputeId]: text,
    }));
  };

  return (
    <div className="min-h-screen bg-ro-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medieval font-bold text-ro-dark mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie disputas e moderação do marketplace</p>
        </div>

        <Tabs defaultValue="disputes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="disputes">
              <Gavel className="h-4 w-4 mr-2" />
              Disputas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disputes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-ro-dark">Disputas Abertas</h2>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    {disputes.filter((d: any) => d.status === 'open').length} Pendentes
                  </Badge>
                  <Badge variant="secondary">
                    {disputes.filter((d: any) => d.status === 'investigating').length} Investigando
                  </Badge>
                  <Badge>
                    {disputes.filter((d: any) => d.status === 'resolved').length} Resolvidas
                  </Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {disputes.map((dispute: any) => (
                    <Card key={dispute.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            Disputa #{dispute.id.slice(-6)}
                          </CardTitle>
                          <Badge variant={
                            dispute.status === 'resolved' ? 'default' :
                            dispute.status === 'investigating' ? 'secondary' :
                            'destructive'
                          }>
                            {dispute.status === 'resolved' ? 'Resolvida' :
                             dispute.status === 'investigating' ? 'Investigando' :
                             'Aberta'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Reportado por: {dispute.reporter?.firstName || 'Usuário'}</p>
                          <p>Data: {new Date(dispute.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p>Transação: {dispute.transaction?.listing?.title}</p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 space-y-4">
                        {/* Dispute Details */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                            Motivo da Disputa
                          </h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">
                            {dispute.reason}
                          </p>
                        </div>

                        {/* Evidence */}
                        {dispute.evidence && dispute.evidence.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Evidências</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {dispute.evidence.map((evidence: string, index: number) => (
                                <img
                                  key={index}
                                  src={evidence}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => window.open(evidence, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Transaction Info */}
                        <div className="bg-blue-50 p-4 rounded">
                          <h4 className="font-semibold mb-2">Informações da Transação</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Item:</strong> {dispute.transaction?.listing?.title}</p>
                              <p><strong>Valor:</strong> R$ {parseFloat(dispute.transaction?.amount || '0').toFixed(2)}</p>
                            </div>
                            <div>
                              <p><strong>Comprador:</strong> {dispute.transaction?.buyer?.firstName || 'Usuário'}</p>
                              <p><strong>Vendedor:</strong> {dispute.transaction?.seller?.firstName || 'Usuário'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Resolution */}
                        {dispute.status === 'resolved' ? (
                          <div className="bg-green-50 p-4 rounded">
                            <h4 className="font-semibold mb-2 flex items-center text-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolução Final
                            </h4>
                            <p className="text-green-700">{dispute.resolution}</p>
                            <p className="text-sm text-green-600 mt-2">
                              Resolvida em {new Date(dispute.resolvedAt).toLocaleDateString('pt-BR')} por {dispute.resolvedBy}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Decisão Administrativa</h4>
                              <Textarea
                                placeholder="Digite sua decisão detalhada sobre esta disputa..."
                                value={resolutionTexts[dispute.id] || ''}
                                onChange={(e) => updateResolutionText(dispute.id, e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleResolveDispute(dispute.id)}
                                disabled={resolveDisputeMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver Disputa
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // In a real app, this would mark the dispute as investigating
                                  toast({
                                    title: "Status atualizado",
                                    description: "Disputa marcada como em investigação.",
                                  });
                                }}
                              >
                                Marcar como Investigando
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {disputes.length === 0 && (
                    <div className="text-center py-12">
                      <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma disputa encontrada.</p>
                      <p className="text-gray-400">Todas as transações estão correndo bem!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
