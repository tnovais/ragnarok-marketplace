import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Search, Plus, User, Settings, LogOut, Wallet, ShoppingBag, Store, Gavel } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const walletBalance = parseFloat(user?.walletBalance || "0");

  return (
    <nav className="bg-white shadow-lg border-b-2 border-ro-gold sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-ro-brown to-ro-dark rounded-lg flex items-center justify-center">
              <Crown className="text-ro-gold h-6 w-6" />
            </div>
            <span className="text-2xl font-medieval font-semibold text-ro-dark">RagnaTrade</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Buscar itens, equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2 focus:ring-2 focus:ring-ro-gold focus:border-transparent"
              />
              <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Create Listing Button */}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden sm:flex border-ro-brown text-ro-brown hover:bg-ro-brown hover:text-white"
                >
                  <Link href="/create-listing">
                    <Plus className="h-4 w-4 mr-2" />
                    Vender
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-ro-cream">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-ro-brown text-white">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium text-ro-dark">
                          {user.firstName || 'Usuário'}
                        </span>
                        <div className="flex items-center text-xs text-gray-600">
                          <Wallet className="h-3 w-3 mr-1" />
                          R$ {walletBalance.toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Saldo: R$ {walletBalance.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=listings" className="flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Meus Anúncios
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=transactions" className="flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Transações
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/create-listing" className="flex items-center sm:hidden">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Anúncio
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin access - show for all users in demo */}
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Gavel className="h-4 w-4 mr-2" />
                        Administração
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild className="hover:text-ro-brown">
                  <Link href="/#features">Como Funciona</Link>
                </Button>
                <Button asChild className="bg-ro-brown hover:bg-ro-dark">
                  <a href="/api/login">Entrar</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 focus:ring-2 focus:ring-ro-gold"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </form>
      </div>
    </nav>
  );
}
