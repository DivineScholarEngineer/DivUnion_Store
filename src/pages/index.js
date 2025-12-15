import * as React from 'react';

import AttributeGrid from '../components/AttributeGrid';
import Container from '../components/Container';
import Hero from '../components/Hero';
import BlogPreviewGrid from '../components/BlogPreviewGrid';
import Highlight from '../components/Highlight';
import Layout from '../components/Layout/Layout';
import ProductCollectionGrid from '../components/ProductCollectionGrid';
import ProductCardGrid from '../components/ProductCardGrid';
import Quote from '../components/Quote';
import Title from '../components/Title';

import { generateMockBlogData, generateMockProductData } from '../helpers/mock';

import * as styles from './index.module.css';
import { Link, navigate } from 'gatsby';
import { toOptimizedImage } from '../helpers/general';

const IndexPage = () => {
  const newArrivals = generateMockProductData(3, 'featured');
  const blogData = generateMockBlogData(3);
  const [theme, setTheme] = React.useState('light');

  const featureList = [
    'Animated product previews that loop smoothly for tech and apparel.',
    'Dynamic category filtering across Tech and Apparel lanes.',
    'Personalized welcome banner greeting returning users.',
    'Quick-switch toggle between light and dark themes.',
    'Integrated user feedback form for suggestions.',
    'Wishlist saver to pin tech or apparel drops.',
    'Tech and apparel bundle discounts surfaced in promos.',
    'Featured products carousel per category.',
    'User profile overview with order history and admin status.',
    'FAQ rollup and support chat entry point.',
    'Notification center callout for order updates and admin messages.',
    'SEO-friendly copy blocks for tech and apparel links.',
    'Admin dashboard summary tiles (placeholder).',
    'Multi-language copy hooks baked into CTA buttons.',
    'Lightweight CMS callout for adding new products.',
  ];

  const extraFeatureList = [
    'Inventory-aware badges for low-stock tech gear.',
    'Bundle builder for mixing accessories and apparel.',
    'Minor admin tooling reminder panel.',
    'Chatbot teaser explaining DivUnion expertise.',
    'Quick-save outfit presets.',
    'Audio-ready tech accessory highlights.',
    'Order status timeline preview.',
    'Pro setup recommendations per category.',
    'Sustainability footnotes for apparel materials.',
    'Guided sizing overlay for apparel buyers.',
  ];

  const goToShop = () => {
    navigate('/shop');
  };

  React.useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Layout disablePaddingBottom>
      {/* Hero Container */}
      <Hero
        maxWidth={'500px'}
        image={'/tech/hero-primary.svg'}
        title={'Signal-first gear for builders'}
        subtitle={'Circuits, sensors, and carry built to keep makers in flow'}
        ctaText={'shop the drop'}
        ctaAction={goToShop}
      />

      {/* Message Container */}
      <div className={styles.messageContainer}>
        <p>
          Custom built for creators by{' '}
          <span className={styles.gold}>DivUnion Tech & Apparel</span>
        </p>
        <p>
          where breathable fabrics meet <span className={styles.gold}>smart accessories</span>{' '}
          and <span className={styles.gold}>sleek layering pieces</span>
        </p>
        <div className={styles.themeToggle}>
          <span>Theme:</span>
          <button type="button" onClick={toggleTheme}>
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          </button>
        </div>
      </div>

      <div className={styles.featuresContainer}>
        <Container size={'large'}>
          <Title
            name={'Experience upgrades'}
            subtitle={'A quick glimpse of the tech-forward UX features we are rolling out.'}
          />
          <div className={styles.featureGrid}>
            {featureList.map((item, index) => (
              <div key={index} className={styles.featureCard}>
                <span className={styles.featureNumber}>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className={styles.featureGrid}>
            {extraFeatureList.map((item, index) => (
              <div key={index} className={styles.featureCardAlt}>
                <span className={styles.featureNumber}>+{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Collection Container */}
      <div className={styles.collectionContainer}>
        <Container size={'large'}>
          <Title name={'Featured Techwear'} />
          <ProductCollectionGrid />
        </Container>
      </div>

      {/* New Arrivals */}
      <div className={styles.newArrivalsContainer}>
        <Container>
          <Title name={'New Arrivals'} link={'/shop'} textLink={'view all'} />
          <ProductCardGrid
            spacing={true}
            showSlider
            height={480}
            columns={3}
            data={newArrivals}
          />
        </Container>
      </div>

      {/* Highlight  */}
      <div className={styles.highlightContainer}>
        <Container size={'large'} fullMobile>
            <Highlight
              image={'/tech/highlight.svg'}
              altImage={'highlight image'}
              miniImage={'/tech/highlight-mini.svg'}
              miniImageAlt={'mini highlight image'}
              title={'Performance Systems'}
              description={`Circuit-inspired silhouettes, modular docks, and responsive textiles that move as quickly as your ideas.`}
              textLink={'discover the drop'}
              link={'/shop'}
            />
        </Container>
      </div>

      {/* Promotion */}
      <div className={styles.promotionContainer}>
        <Hero image={toOptimizedImage('/tech/feature-grid.svg')} title={`Bundle & Save \n Core Tech Essentials`} />
        <div className={styles.linkContainers}>
          <Link to={'/shop'}>APPAREL</Link>
          <Link to={'/shop'}>GEAR</Link>
        </div>
      </div>

      {/* Quote */}
      <Quote
        bgColor={'var(--standard-light-grey)'}
        title={'about DivUnion'}
        quote={
          '“We obsess over utility-first design. From recycled technical fibers to modular carry systems, every drop keeps you ready for what is next.”'
        }
      />

      {/* Blog Grid */}
      <div className={styles.blogsContainer}>
        <Container size={'large'}>
          <Title name={'Insights'} subtitle={'Field notes on techwear, gear, and design culture'} />
          <BlogPreviewGrid data={blogData} />
        </Container>
      </div>

      {/* Promotion */}
      <div className={styles.sustainableContainer}>
        <Hero
          image={toOptimizedImage('/tech/responsible.svg')}
          title={'Responsible by default'}
          subtitle={
            'Low-energy circuitry, recycled composites, and transparent supply chains keep every build grounded in responsibility.'
          }
          ctaText={'learn more'}
          maxWidth={'660px'}
          ctaStyle={styles.ctaCustomButton}
        />
      </div>

      {/* Social Media */}
      <div className={styles.socialContainer}>
        <Title
          name={'Styled by You'}
          subtitle={'Tag @divunion to share your techwear setups.'}
        />
        <div className={styles.socialContentGrid}>
          <img src={toOptimizedImage(`/tech/social/social1.svg`)} alt={'social media 1'} />
          <img src={toOptimizedImage(`/tech/social/social2.svg`)} alt={'social media 2'} />
          <img src={toOptimizedImage(`/tech/social/social3.svg`)} alt={'social media 3'} />
          <img src={toOptimizedImage(`/tech/social/social4.svg`)} alt={'social media 4'} />
        </div>
      </div>
      <AttributeGrid />
    </Layout>
  );
};

export default IndexPage;
