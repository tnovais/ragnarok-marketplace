import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Clock, AlertTriangle, Upload, Shield } from "lucide-react";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    itemName: string;
    price: string;
    server: { name: string };
    seller: { firstName?: string; lastName?: string };
  };
  transaction?: {
    id: string;
    status: string;
    buyerConfirmed: boolean;
    sellerConfirmed: boolean;
    buyerEvidence: string[];
    sellerEvidence: string[];
  };
}

export default function TransactionModal({ open, onClose, listing, transaction }: TransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceInput, setEvidenceInput] = useState("");

  const confirmTransactionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/transactions/${transaction?.id}/confirm`, {
        evidence,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      toast({
        title: "Confirmação registrada!",
        description: "Sua confirmação foi enviada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro na confirmação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const addEvidence = () => {
    if (evidenceInput.trim()) {
      setEvidence([...evidence, evidenceInput.trim()]);
      setEvidenceInput("");
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const price = parseFloat(listing.price);
  const sellerName = listing.seller.firstName 
    ? `${listing.seller.firstName} ${listing.seller.lastName || ''}`.trim()
    : 'Vendedor';

  // If no transaction, show purchase confirmation
  if (!transaction) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Compra Realizada com Sucesso!
            </DialogTitle>
            <DialogDescription>
              Seu pagamento foi processado e o vendedor foi notificado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{listing.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Servidor: {listing.server.name}</p>
                  <p>Vendedor: {sellerName}</p>
                  <p>Valor: R$ {price.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Próximos Passos
              </h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Aguarde o vendedor entrar em contato</li>
                <li>Combine a entrega no jogo</li>
                <li>Confirme o recebimento do item</li>
                <li>O pagamento será liberado automaticamente</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-yellow-600" />
                Proteção RagnaTrade
              </h4>
              <p className="text-sm">
                Seu dinheiro está protegido em custódia até você confirmar o recebimento do item.
                Você tem 7 dias para abrir uma disputa se houver problemas.
              </p>
            </div>

            <Button onClick={onClose} className="w-full">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Transaction confirmation interface
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar Transação</DialogTitle>
          <DialogDescription>
            Confirme que você recebeu o item conforme descrito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{listing.title}</h3>
                <Badge variant={
                  transaction.status === 'completed' ? 'default' :
                  transaction.status === 'disputed' ? 'destructive' :
                  'secondary'
                }>
                  {transaction.status === 'completed' ? 'Concluída' :
                   transaction.status === 'disputed' ? 'Em Disputa' :
                   transaction.status === 'delivered' ? 'Entregue' :
                   'Aguardando Entrega'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Item:</p>
                  <p className="font-medium">{listing.itemName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Servidor:</p>
                  <p className="font-medium">{listing.server.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor:</p>
                  <p className="font-medium">R$ {price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vendedor:</p>
                  <p className="font-medium">{sellerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Status */}
          <div className="grid grid-cols-2 gap-4">
            <Card className={transaction.buyerConfirmed ? "border-green-500" : "border-gray-200"}>
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  transaction.buyerConfirmed ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {transaction.buyerConfirmed ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <p className="text-sm font-medium">Comprador</p>
                <p className="text-xs text-gray-600">
                  {transaction.buyerConfirmed ? 'Confirmado' : 'Aguardando'}
                </p>
              </CardContent>
            </Card>

            <Card className={transaction.sellerConfirmed ? "border-green-500" : "border-gray-200"}>
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  transaction.sellerConfirmed ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {transaction.sellerConfirmed ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <p className="text-sm font-medium">Vendedor</p>
                <p className="text-xs text-gray-600">
                  {transaction.sellerConfirmed ? 'Confirmado' : 'Aguardando'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Evidence Upload */}
          {!transaction.buyerConfirmed && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Evidências da Transação (Opcional)
              </Label>
              <p className="text-xs text-gray-600 mb-3">
                Adicione URLs de capturas de tela que comprovem o recebimento do item.
              </p>
              
              <div className="space-y-2">
                {evidence.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <img 
                      src={url} 
                      alt={`Evidence ${index + 1}`} 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidence(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Cole a URL da captura de tela..."
                    value={evidenceInput}
                    onChange={(e) => setEvidenceInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={addEvidence}
                    disabled={!evidenceInput.trim()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {!transaction.buyerConfirmed ? (
              <>
                <Button
                  onClick={() => confirmTransactionMutation.mutate()}
                  disabled={confirmTransactionMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {confirmTransactionMutation.isPending ? "Confirmando..." : "Confirmar Recebimento"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would open dispute form
                    toast({
                      title: "Disputa",
                      description: "Funcionalidade de disputa será implementada em breve.",
                    });
                  }}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Abrir Disputa
                </Button>
              </>
            ) : (
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Transação Confirmada</span>
                </div>
                <p className="text-sm text-gray-600">
                  {transaction.sellerConfirmed 
                    ? "O pagamento foi liberado para o vendedor."
                    : "Aguardando confirmação do vendedor."
                  }
                </p>
              </div>
            )}
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
