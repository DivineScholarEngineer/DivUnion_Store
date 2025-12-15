import * as React from 'react';
import { navigate } from 'gatsby';

import Container from '../components/Container';
import Hero from '../components/Hero';
import Layout from '../components/Layout/Layout';
import ProductCardGrid from '../components/ProductCardGrid';
import Title from '../components/Title';
import Highlight from '../components/Highlight';

import { generateMockProductData } from '../helpers/mock';
import { toOptimizedImage } from '../helpers/general';

import * as styles from './index.module.css';

const IndexPage = () => {
  const techProducts = generateMockProductData(6, 'tech');
  const apparelProducts = generateMockProductData(6, 'apparel');

  const goToShop = () => {
    navigate('/shop');
  };

  return (
    <Layout disablePaddingBottom>
      <Hero
        maxWidth={'520px'}
        image={'/tech/hero-primary.svg'}
        title={'DevUnion Tech'}
        subtitle={'Signal-first gear, apparel, and accessories built for builders.'}
        ctaText={'Shop the collection'}
        ctaAction={goToShop}
      />

      <div className={styles.bannerCopy}>
        <Container size={'large'}>
          <p className={styles.tagline}>Vertical, brand-first, and ready to scroll.</p>
          <p className={styles.supporting}>
            DevUnion Tech anchors every drop with secure roles, locked-down carts,
            and responsive layouts so guests, users, and admins always know where they stand.
          </p>
        </Container>
      </div>

      <div className={styles.sectionSpacing}>
        <Container size={'large'}>
          <Title name={'Tech'} subtitle={'Control hubs, wearables, sensors, and signal gear.'} />
          <ProductCardGrid data={techProducts} spacing={true} columns={3} />
        </Container>
      </div>

      <div className={styles.sectionSpacing}>
        <Container size={'large'}>
          <Title
            name={'Apparel'}
            subtitle={'Layering built for motion with clear categories for every fit.'}
          />
          <div className={styles.subCategoryRow}>
            <span>Male apparel</span>
            <span>Female apparel</span>
            <span>Accessories</span>
          </div>
          <ProductCardGrid data={apparelProducts} spacing={true} columns={3} />
        </Container>
      </div>

      <div className={styles.sectionSpacing}>
        <Container size={'large'} fullMobile>
          <Highlight
            image={toOptimizedImage('/tech/responsible.svg')}
            altImage={'Responsible design'}
            miniImage={toOptimizedImage('/tech/highlight-mini.svg')}
            miniImageAlt={'Responsible icon'}
            title={'Admin-aware by default'}
            description={`Guest, user, minor admin, and main admin views stay separated. Carts, favorites, and approvals only unlock after sign-in.`}
            textLink={'review access rules'}
            link={'/login'}
          />
        </Container>
      </div>
    </Layout>
  );
};

export default IndexPage;
