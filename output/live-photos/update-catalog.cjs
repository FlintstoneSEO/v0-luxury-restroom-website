const fs=require('fs');const p='app/luxury-restroom-trailer-rentals/page.tsx';let s=fs.readFileSync(p,'utf8');s=s.replace('import { FeatureGrid } from "@/components/feature-grid"','import "./trailer-presentation.css"').replace('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"\r\n','').replace('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"\n','');
const start=s.indexOf('        {/* Features */}'),end=s.indexOf('        {/* Why Luxury Trailers */}');s=s.slice(0,start)+`        {/* Features */}
        <section className="catalog-features bg-white" aria-labelledby="catalog-features-heading">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="catalog-features-layout">
              <div className="catalog-features-intro">
                <h2 id="catalog-features-heading">Premium Features &amp; Finishes</h2>
                <p>Every detail is designed for comfort, cleanliness, and a premium guest experience.</p>
                {interiorGallery[0] && <figure className="catalog-interior-photo">
                  <Image src={interiorGallery[0].src} alt={interiorGallery[0].alt} fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" />
                </figure>}
                <Link href="#interior-details" className="estate-text-link">Step Inside Our Trailers<ArrowRight aria-hidden="true" size={18} /></Link>
              </div>
              <div className="catalog-feature-list">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return <div className="catalog-feature" key={feature.title}>
                    <Icon aria-hidden="true" size={26} strokeWidth={1.5} />
                    <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
                  </div>
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Trailer Options */}
        <section className="catalog-options bg-cream" aria-labelledby="catalog-options-heading">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="catalog-options-intro">
              <h2 id="catalog-options-heading">Choose the Right Size for Your Event</h2>
              <p>We offer multiple trailer configurations to match your guest count and space requirements.</p>
            </div>
            <div className="catalog-options-grid">
              {trailerOptions.map((trailer) => (
                <article key={trailer.slug} id={trailer.slug.replace(/-trailer$/, "")}
                  className={\`catalog-option scroll-mt-32\${trailer.popular ? " catalog-option-popular" : ""}\`}
                  aria-labelledby={\`\${trailer.slug}-heading\`}>
                  <div className="catalog-option-label">{trailer.popular && <span>Most Popular</span>}</div>
                  <header>
                    <h3 id={\`\${trailer.slug}-heading\`}>{trailer.name}</h3>
                    <p className="catalog-option-capacity"><Users aria-hidden="true" size={20} />{trailer.capacity}</p>
                  </header>
                  <p className="catalog-option-description">{trailer.description}</p>
                  <ul>{trailer.features.map((feature) => <li key={feature}><CheckCircle aria-hidden="true" size={18} /><span>{feature}</span></li>)}</ul>
                  <Link className="catalog-option-cta" href="/request-quote">Check Availability<ArrowRight aria-hidden="true" size={18} /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

`+s.slice(end);fs.writeFileSync(p,s);
