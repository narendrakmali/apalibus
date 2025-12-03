
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Bus, Sofa, ShieldCheck } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-container">
          
          <div className="hero-text">
            <h1>Book Buses<br/>with Ease</h1>
            <p>Reliable, Comfortable, and Verified Operators for all your travel needs. Get instant estimates and book your journey in minutes.</p>
            
            <div className="cta-group">
              <Link href="/search" className="btn btn-primary-cyan">
                Get an Estimate
              </Link>
              <Link href="/explore-routes" className="btn btn-outline-glass">
                Explore Routes
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <div className="image-wrapper">
              <Image 
                src={placeholderImages.heroBus.src} 
                alt={placeholderImages.heroBus.alt}
                width={1000}
                height={667}
                data-ai-hint={placeholderImages.heroBus.hint}
                priority
              />
            </div>
          </div>

        </div>
      </section>

      <section className="features-bar">
        <div className="features-container">
          
          <div className="feature-item">
            <div className="icon-box">
              <Bus />
            </div>
            <div className="text-box">
              <h4>Reliable</h4>
              <p>Verified bus operators</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="icon-box">
              <Sofa />
            </div>
            <div className="text-box">
              <h4>Comfortable</h4>
              <p>Clean & luxury seating</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="icon-box">
              <ShieldCheck />
            </div>
            <div className="text-box">
              <h4>Safe Travel</h4>
              <p>Tracked & insured trips</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

    