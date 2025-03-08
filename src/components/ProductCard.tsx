import { Product } from '@/types/ecommerce';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:scale-105">
        <CardHeader className="p-0">
          <div className="relative aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 p-4">
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
          <div className="flex items-center justify-between">
            <p className="font-semibold">{formatPrice(product.price)}</p>
            <Badge variant={product.inStock ? "default" : "destructive"}>
              {product.inStock ? "En stock" : "Rupture"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 