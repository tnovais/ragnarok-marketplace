import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import { useLocation } from "wouter";
import { Crown, Plus, X } from "lucide-react";

const createListingSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  price: z.string().min(1, "Preço é obrigatório"),
  itemName: z.string().min(2, "Nome do item é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  serverId: z.string().min(1, "Servidor é obrigatório"),
  isPromoted: z.boolean().default(false),
  screenshots: z.array(z.string()).default([]),
});

type CreateListingForm = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

  const { data: servers = [] } = useQuery({
    queryKey: ['/api/servers'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const form = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      itemName: "",
      categoryId: "",
      serverId: "",
      isPromoted: false,
      screenshots: [],
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingForm) => {
      const response = await apiRequest("POST", "/api/listings", {
        ...data,
        categoryId: parseInt(data.categoryId),
        serverId: parseInt(data.serverId),
        price: parseFloat(data.price),
        screenshots: screenshotUrls,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/listings'] });
      toast({
        title: "Anúncio criado com sucesso!",
        description: "Seu item já está disponível no marketplace.",
      });
      setLocation("/profile");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar anúncio",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateListingForm) => {
    createListingMutation.mutate(data);
  };

  const addScreenshot = () => {
    const url = prompt("Digite a URL da captura de tela:");
    if (url && url.trim()) {
      setScreenshotUrls([...screenshotUrls, url.trim()]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== index));
  };

  const price = form.watch("price");
  const isPromoted = form.watch("isPromoted");
  const priceNum = parseFloat(price) || 0;
  
  // Calculate fees
  const baseFeeRate = priceNum >= 200 ? 0.10 : 0.15;
  const finalFeeRate = isPromoted ? 0.06 : baseFeeRate;
  const fee = priceNum * finalFeeRate;
  const netAmount = priceNum - fee;
  const promotionCost = 20; // R$ 20 for promoted listings

  return (
    <div className="min-h-screen bg-ro-light">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medieval font-bold text-ro-dark mb-2">Criar Anúncio</h1>
          <p className="text-gray-600">Venda seus itens com segurança total</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Item</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serverId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servidor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    </div>

                    <FormField
                      control={form.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Item</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Excalibur [4]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Anúncio</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Vendo Excalibur [4] +10 com cartas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva detalhadamente o item, suas características, cartas aplicadas, etc."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Screenshots */}
                    <div>
                      <Label>Capturas de Tela</Label>
                      <div className="mt-2 space-y-2">
                        {screenshotUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <img src={url} alt={`Screenshot ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                            <span className="flex-1 text-sm truncate">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeScreenshot(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addScreenshot}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Captura de Tela
                        </Button>
                      </div>
                    </div>

                    {/* Promoted Listing */}
                    <FormField
                      control={form.control}
                      name="isPromoted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-ro-gold bg-gradient-to-r from-ro-cream to-white p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center">
                              <Crown className="h-4 w-4 text-ro-gold mr-2" />
                              Anúncio Promovido (R$ 20,00/mês)
                            </FormLabel>
                            <p className="text-sm text-gray-600">
                              Destaque seu anúncio e pague apenas 6% de taxa!
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-ro-brown hover:bg-ro-dark"
                      disabled={createListingMutation.isPending}
                    >
                      {createListingMutation.isPending ? "Criando..." : "Criar Anúncio"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fee Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Calculadora de Taxas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Preço de Venda:</span>
                  <span className="font-bold">R$ {priceNum.toFixed(2)}</span>
                </div>
                
                {isPromoted && (
                  <div className="flex justify-between text-ro-gold">
                    <span>Custo da Promoção:</span>
                    <span className="font-bold">- R$ {promotionCost.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Taxa ({(finalFeeRate * 100).toFixed(0)}%):</span>
                  <span className="text-red-600">- R$ {fee.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Você recebe:</span>
                    <span className="text-ro-brown">
                      R$ {(netAmount - (isPromoted ? promotionCost : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {priceNum > 0 && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Dinheiro fica em custódia até entrega confirmada</p>
                    <p>• Liberação em até 72h após confirmação</p>
                    <p>• 7 dias para abertura de disputas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Dicas para Vender</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Use títulos descritivos e claros</p>
                <p>• Adicione capturas de tela do item</p>
                <p>• Descreva todas as características</p>
                <p>• Informe cartas e refinamentos</p>
                <p>• Seja transparente sobre defeitos</p>
                <p>• Responda rapidamente compradores</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
