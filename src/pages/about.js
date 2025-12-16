import React, { useRef } from 'react';

import Container from '../components/Container';
import Hero from '../components/Hero';
import ThemeLink from '../components/ThemeLink';
import Layout from '../components/Layout/Layout';

import * as styles from './about.module.css';
import { toOptimizedImage } from '../helpers/general';
const AboutPage = () => {
  const historyRef = useRef();
  const valuesRef = useRef();
  const sustainabilityRef = useRef();

  const handleScroll = (elementReference) => {
    if (elementReference) {
      window.scrollTo({
        behavior: 'smooth',
        top: elementReference.current.offsetTop - 280,
      });
    }
  };

  return (
    <Layout disablePaddingBottom>
      <div className={styles.root}>
        {/* Hero Container */}
        <Hero
          maxWidth={'900px'}
          image={'/hero/banner-clean.svg'}
          title={`DivUnion Tech \n Built for creators and operators`}
        />

        <div className={styles.navContainer}>
          <ThemeLink onClick={() => handleScroll(historyRef)} to={'#history'}>
            Our story
          </ThemeLink>
          <ThemeLink onClick={() => handleScroll(valuesRef)} to={'#values'}>
            Values
          </ThemeLink>
          <ThemeLink
            onClick={() => handleScroll(sustainabilityRef)}
            to={'#sustainability'}
          >
            Integrity
          </ThemeLink>
        </div>

        <Container size={'large'} spacing={'min'}>
          <div className={styles.detailContainer} ref={historyRef}>
            <p>
              DivUnion Tech was founded to blend hardware, textiles, and software
              into a single calm experience. We prototype quickly, cut what
              doesn&apos;t serve builders, and obsess over reliability.
            </p>
            <br />
            <br />
            <p>
              Our teams work across signal processing, wearable interfaces, and
              modular carry systems. Every drop is tested in real labs and daily
              commutes before it makes it to the store.
            </p>
          </div>
        </Container>

        <div className={styles.imageContainer}>
          <img alt={'DivUnion workshop'} src={toOptimizedImage('/about1.png')}></img>
        </div>

        <Container size={'large'} spacing={'min'}>
          <div className={styles.content}>
            <h3>Our Values</h3>
            <div ref={valuesRef}>
              <p>
                We value clarity, durability, and permissioned access. Systems
                are built to protect user roles first, then scale performance.
              </p>
              <ol>
                <li>Keep data locked down and auditable.</li>
                <li>Design for everyday use, not just launch day.</li>
                <li>Ship responsibly sourced materials and code.</li>
              </ol>
              <img alt={'DivUnion team'} src={toOptimizedImage('/about2.png')}></img>
            </div>
            <h3>Integrity</h3>
            <div id={'#sustainability'} ref={sustainabilityRef}>
              <p>
                From recycled technical fabrics to transparent admin controls,
                DivUnion Tech keeps sustainability and security paired together.
              </p>
              <p>
                Admin roles cannot be self-assigned; every change is reviewed so
                customers always know who controls their data and orders.
              </p>
              <p>
                This discipline keeps the platform ready for the next wave of
                features without compromising trust.
              </p>
            </div>
          </div>
        </Container>

        <div className={styles.imageContainer}>
          <img alt={'DivUnion prototype'} src={toOptimizedImage('/about3.png')}></img>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
