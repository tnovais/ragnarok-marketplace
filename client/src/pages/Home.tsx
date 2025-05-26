import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import FeaturedItems from "@/components/FeaturedItems";
import SearchFilters from "@/components/SearchFilters";
import ItemCard from "@/components/ItemCard";
import SecurityFeatures from "@/components/SecurityFeatures";
import { useState } from "react";

export default function Home() {
  const [filters, setFilters] = useState({
    serverId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    search: "",
    isOfficial: undefined as boolean | undefined,
    isPromoted: undefined as boolean | undefined,
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['/api/listings', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
      return fetch(`/api/listings?${params}`).then(res => res.json());
    },
  });

  return (
    <div className="min-h-screen bg-ro-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ro-dark via-ro-brown to-ro-dark text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-ro-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-medieval font-bold mb-4">
            Marketplace de <span className="text-ro-gold">Ragnarok Online</span>
          </h1>
          <p className="text-lg md:text-xl text-ro-cream">
            Compre e venda com segurança total
          </p>
        </div>
      </section>

      {/* Featured Items */}
      <FeaturedItems />

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-ro-dark">Anúncios da Comunidade</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ro-gold">
                    <option>Mais Recentes</option>
                    <option>Menor Preço</option>
                    <option>Maior Preço</option>
                    <option>Melhor Avaliação</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                      <div className="bg-white p-6 rounded-b-lg">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded mb-3 w-1/2"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing: any) => (
                    <ItemCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}

              {!isLoading && listings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhum item encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SecurityFeatures />
    </div>
  );
}
