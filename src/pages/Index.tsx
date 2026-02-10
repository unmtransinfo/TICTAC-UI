import { Link } from 'react-router-dom';
import { ArrowRight, Database, Search, GitBranch, FlaskConical, Target, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MolecularBackground } from '@/components/MolecularBackground';
import { SearchBar } from '@/components/SearchBar';
import { TDLBadge } from '@/components/TDLBadge';
import { platformStats, mockDiseases } from '@/data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Molecular Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
          <MolecularBackground className="opacity-60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FlaskConical className="h-4 w-4" />
              Powered by Clinical Trial Evidence
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              Illuminate Drug Targets
              <br />
              <span className="text-primary">Through Clinical Evidence</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Explore validated disease-target associations from 500K+ clinical trials.
              Trace every insight back to its source.
            </p>

            {/* Search Bar */}
            <div className="flex justify-center mb-12">
              <SearchBar autoFocus />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              <span className="text-muted-foreground text-sm">Popular:</span>
              {mockDiseases.slice(0, 3).map((disease) => (
                <Link
                  key={disease.id}
                  to={`/dashboard?disease=${encodeURIComponent(disease.doid)}`}
                  className="text-sm text-primary hover:underline"
                >
                  {disease.name}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Clinical Trials', value: platformStats.clinicalTrials, icon: Database },
                { label: 'Gene Targets', value: platformStats.geneTargets, icon: Target },
                { label: 'Diseases', value: platformStats.diseases, icon: FlaskConical },
                { label: 'Publications', value: platformStats.publications, icon: FileText },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <stat.icon className="h-6 w-6 text-primary mb-2 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How TICTAC Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Target Illumination by Clinical Trial Analytics & Citations aggregates evidence
              from clinical trials to score disease-target associations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Search',
                description:
                  'Enter a disease or gene target to explore validated associations across clinical trials.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Explore',
                description:
                  'View ranked targets with meanRankScore, publication counts, and Target Development Level (TDL).',
                icon: Target,
              },
              {
                step: '03',
                title: 'Trace Provenance',
                description:
                  'Drill into any association to see the complete evidence trail—clinical trials, publications, and citations.',
                icon: GitBranch,
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="absolute -top-4 left-6 px-3 py-1 bg-primary text-primary-foreground text-sm font-mono font-bold rounded-full">
                  {item.step}
                </div>
                <item.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TDL Legend Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Target Development Levels
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each target is classified by its development level, indicating the maturity of drug discovery efforts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {(['Tclin', 'Tchem', 'Tbio', 'Tdark'] as const).map((tdl) => (
              <div key={tdl} className="p-6 rounded-xl bg-card border border-border/50 text-center">
                <TDLBadge tdl={tdl} showTooltip={false} className="text-lg px-4 py-1 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {tdl === 'Tclin' && 'Approved drugs or mechanism of action known'}
                  {tdl === 'Tchem' && 'Active compounds in development'}
                  {tdl === 'Tbio' && 'Biological annotation available'}
                  {tdl === 'Tdark' && 'Understudied, limited annotation'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Exploring Evidence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Dive into the TICTAC database and discover evidence-backed disease-target associations.
          </p>
          <Button asChild size="lg" className="group">
            <Link to="/dashboard">
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            TICTAC Research Platform • Based on{' '}
            <a
              href="https://www.frontiersin.org/journals/bioinformatics/articles/10.3389/fbinf.2025.1579865/full"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TICTAC methodology
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
