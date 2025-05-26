import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    serverId: number | undefined;
    categoryId: number | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    search: string;
    isOfficial: boolean | undefined;
    isPromoted: boolean | undefined;
  };
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const { data: servers = [] } = useQuery({
    queryKey: ['/api/servers'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      serverId: undefined,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      search: "",
      isOfficial: undefined,
      isPromoted: undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== "" && value !== null
  ).length;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Busca
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium">
            Buscar
          </Label>
          <Input
            id="search"
            placeholder="Nome do item..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Server Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Servidor
          </Label>
          <Select
            value={filters.serverId?.toString() || ""}
            onValueChange={(value) => updateFilter('serverId', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os Servidores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Servidores</SelectItem>
              {servers.map((server: any) => (
                <SelectItem key={server.id} value={server.id.toString()}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Categoria
          </Label>
          <Select
            value={filters.categoryId?.toString() || ""}
            onValueChange={(value) => updateFilter('categoryId', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as Categorias</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Faixa de Preço (R$)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={filters.minPrice || ""}
              onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              min="0"
              step="0.01"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice || ""}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Special Filters */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Filtros Especiais
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="official"
                checked={filters.isOfficial === true}
                onCheckedChange={(checked) => 
                  updateFilter('isOfficial', checked ? true : undefined)
                }
              />
              <Label htmlFor="official" className="text-sm flex items-center">
                🏛️ Apenas itens oficiais
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="promoted"
                checked={filters.isPromoted === true}
                onCheckedChange={(checked) => 
                  updateFilter('isPromoted', checked ? true : undefined)
                }
              />
              <Label htmlFor="promoted" className="text-sm flex items-center">
                👑 Apenas promovidos
              </Label>
            </div>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Filtros Rápidos
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('minPrice', undefined);
                updateFilter('maxPrice', 50);
              }}
              className="text-xs"
            >
              Até R$ 50
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('minPrice', 50);
                updateFilter('maxPrice', 200);
              }}
              className="text-xs"
            >
              R$ 50-200
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('minPrice', 200);
                updateFilter('maxPrice', 500);
              }}
              className="text-xs"
            >
              R$ 200-500
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter('minPrice', 500);
                updateFilter('maxPrice', undefined);
              }}
              className="text-xs"
            >
              R$ 500+
            </Button>
          </div>
        </div>

        {/* Apply/Clear Buttons */}
        <div className="pt-4 border-t">
          <Button
            className="w-full bg-ro-brown hover:bg-ro-dark mb-2"
            onClick={() => {
              // Trigger filter application (filters are already applied via state)
            }}
          >
            Aplicar Filtros
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={clearAllFilters}
            >
              Limpar Todos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
