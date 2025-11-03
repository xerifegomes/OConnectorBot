import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            oConnector
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="#features" className="text-sm hover:text-primary">
              Recursos
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-primary">
              Como Funciona
            </Link>
            <Link href="#pricing" className="text-sm hover:text-primary">
              Preços
            </Link>
            <Link href="/login" className="text-sm hover:text-primary">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Transforme Seu Negócio com IA e Automação
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Landing Page + Bot WhatsApp Inteligente para sua empresa
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
              <Link href="#how-it-works">Ver Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Por que escolher o oConnector?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">🤖</div>
                <CardTitle>Bot WhatsApp com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Atendimento 24h automatizado que qualifica leads enquanto você dorme
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">🌐</div>
                <CardTitle>Landing Page Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Design responsivo e otimizado para conversão
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle>Dashboard Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gerencie leads, mensagens e métricas em tempo real
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle>Preço Justo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  A partir de R$ 2.500 + R$ 500/mês
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "1", title: "Cadastre-se", desc: "Crie sua conta em menos de 2 minutos" },
              { number: "2", title: "Configure", desc: "Personalize seu bot e landing page" },
              { number: "3", title: "Publique", desc: "Seu site e bot entram no ar instantaneamente" },
              { number: "4", title: "Fature", desc: "Comece a capturar e converter leads" },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Planos e Preços</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "R$ 2.500",
                recurring: "R$ 500/mês",
                features: [
                  "Landing Page Profissional",
                  "Bot WhatsApp Básico",
                  "Dashboard de Leads",
                  "3 meses suporte",
                ],
                highlight: false,
              },
              {
                name: "Professional",
                price: "R$ 4.500",
                recurring: "R$ 600/mês",
                features: [
                  "Tudo do Starter +",
                  "Bot com IA Avançada",
                  "Site Multi-páginas",
                  "Integração CRM",
                  "Relatórios Avançados",
                ],
                highlight: true,
              },
              {
                name: "Premium",
                price: "R$ 7.500",
                recurring: "R$ 900/mês",
                features: [
                  "Tudo do Professional +",
                  "Bot Treinado em seus dados",
                  "Site Completo (7+ páginas)",
                  "Automação Completa",
                  "Suporte Prioritário",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlight ? "border-primary border-2" : ""}
              >
                <CardHeader>
                  {plan.highlight && (
                    <div className="text-xs font-semibold text-primary mb-2">
                      MAIS POPULAR
                    </div>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.recurring}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/cadastro?plano=${plan.name.toLowerCase()}`}>
                      Escolher {plan.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sem cartão de crédito. Setup em 5 minutos.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/cadastro">Criar Minha Conta Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 oConnector. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

