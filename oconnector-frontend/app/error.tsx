'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para o console
    console.error('Erro capturado:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Erro na Aplicação</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar a página. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Detalhes do erro:</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {error.message || 'Erro desconhecido'}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="flex-1"
            >
              Ir para Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

