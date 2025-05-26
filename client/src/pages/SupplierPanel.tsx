import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const supplierOfferSchema = z.object({
  itemName: z.string().min(1, "Nome do item é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unitPrice: z.string().min(1, "Preço unitário é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  categoryId: z.number().min(1, "Categoria é obrigatória"),
  serverId: z.number().min(1, "Servidor é obrigatório"),
});

type SupplierOfferForm = z.infer<typeof supplierOfferSchema>;

export default function SupplierPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create");

  const form = useForm<SupplierOfferForm>({
    resolver: zodResolver(supplierOfferSchema),
    defaultValues: {
      itemName: "",
      quantity: 1,
      unitPrice: "",
      description: "",
      categoryId: 0,
      serverId: 0,
    },
  });

  // Fetch servers and categories
  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch supplier offers
  const { data: supplierOffers = [], isLoading } = useQuery({
    queryKey: ["/api/supplier-offers"],
  });

  // Create supplier offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (data: SupplierOfferForm) => {
      return apiRequest({
        endpoint: "/api/supplier-offers",
        method: "POST",
        body: { ...data, supplierId: user?.id },
      });
    },
    onSuccess: () => {
      toast({
        title: "Oferta enviada!",
        description: "Sua oferta foi enviada para análise do site.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-offers"] });
      setActiveTab("offers");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar oferta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupplierOfferForm) => {
    createOfferMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "accepted": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (!user?.isSupplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
            <CardDescription className="text-center">
              Você precisa ser um fornecedor autorizado para acessar esta página.
              Entre em contato com o suporte para solicitar acesso.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Painel do Fornecedor
        </h1>
        <p className="text-muted-foreground">
          Venda seus itens diretamente para o site com preços competitivos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Nova Oferta</TabsTrigger>
          <TabsTrigger value="offers">Minhas Ofertas</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Criar Nova Oferta
              </CardTitle>
              <CardDescription>
                Ofereça seus itens para venda direta ao site. Preços competitivos e pagamento garantido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Item</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: +9 Katar of Speed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Unitário (R$)</FormLabel>
                          <FormControl>
                            <Input placeholder="100.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serverId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Servidor</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o servidor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {servers.map((server: any) => (
                                <SelectItem key={server.id} value={server.id.toString()}>
                                  {server.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o item, suas características e condições..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createOfferMutation.isPending}
                    className="w-full"
                  >
                    {createOfferMutation.isPending ? "Enviando..." : "Enviar Oferta"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Minhas Ofertas
              </CardTitle>
              <CardDescription>
                Acompanhe o status das suas ofertas enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando ofertas...</p>
                </div>
              ) : supplierOffers.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Você ainda não fez nenhuma oferta
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supplierOffers.map((offer: any) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{offer.itemName}</h3>
                        <Badge variant={getStatusColor(offer.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(offer.status)}
                            {offer.status === "pending" && "Pendente"}
                            {offer.status === "accepted" && "Aceita"}
                            {offer.status === "rejected" && "Rejeitada"}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantidade</p>
                          <p className="font-medium">{offer.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Preço Unitário</p>
                          <p className="font-medium">R$ {offer.unitPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">
                            R$ {(parseFloat(offer.unitPrice) * offer.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data</p>
                          <p className="font-medium">
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {offer.acceptedQuantity && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>Aceita:</strong> {offer.acceptedQuantity} unidades
                          </p>
                        </div>
                      )}

                      {offer.adminNotes && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Observações:</strong> {offer.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}