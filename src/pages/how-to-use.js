import React, { useRef } from 'react';
import * as styles from './about.module.css';

import Layout from '../components/Layout/Layout';
import ThemeLink from '../components/ThemeLink';
import Container from '../components/Container';
import Button from '../components/Button';
import { toOptimizedImage } from '../helpers/general';

const HowToUsePage = () => {
  const builtRef = useRef();
  const toolsRef = useRef();

  const handleScroll = (elementReference) => {
    if (elementReference) {
      window.scrollTo({
        behavior: 'smooth',
        top: elementReference.current.offsetTop - 280,
      });
    }
  };

  return (
    <Layout>
      <div className={styles.root}>
        <div className={styles.navContainer}>
          <ThemeLink onClick={() => handleScroll(builtRef)} to={'#builtby'}>
            Who built this experience
          </ThemeLink>
          <ThemeLink onClick={() => handleScroll(toolsRef)} to={'#tools'}>
            Compatible technologies
          </ThemeLink>
        </div>
        <Container size={'large'} spacing={'min'}>
          <div className={styles.content} style={{ paddingTop: '80px' }}>
            <h3>Built by Matter.</h3>
            <div id="#builtBy" ref={builtRef}>
              <p>
                This deployment is maintained by the team at{' '}
                <Button target={true} href="https://matterdesign.com.au/">
                  Matter Design & Digital
                </Button>{' '}
                (Matter.).
              </p>
              <p>
                The DevUnion Tech build runs on a JAMStack-friendly architecture
                suitable for headless commerce. You can pair it with platforms
                that support tokenized APIs and server-side validation.
              </p>
              <p>
                Matter. has pre-built connections to microservices available
                through its JAMM.™ solution. JAMM.™ orchestrates data securely and
                publishes sites to an edge network for fast performance.
              </p>
              <Button target={true} href="https://jamm.matter.design/">
                Read more about JAMM.™
              </Button>
              <img
                alt={'JAMM Detail'}
                src={toOptimizedImage('/how-to-use/jamm-sydney-1upd@2x.png')}
                style={{ display: 'block', height: 'auto' }}
              />
            </div>
            <h3>Best of Breed Tools</h3>
            <div id={'#tools'} ref={toolsRef}>
              <p>
                Headless architecture enables Composable Commerce. What this
                means is that you can compose a suite of best-of-breed tools
                together to create an agile ecommerce system with clear
                permissioning.
              </p>
              <p>
                We prioritize platforms that respect unique usernames,
                non-duplicated emails, and admin gating.
              </p>

              <strong>Ecommerce:</strong>
              <ul>
                <li>BigCommerce</li>
                <li>VTEX (roadmap)</li>
                <li>Commercetools (roadmap)</li>
              </ul>

              <strong>Content Management Systems (CMS):</strong>
              <ul>
                <li>Contentful</li>
                <li>WordPress</li>
                <li>Sanity</li>
                <li>Builder.io</li>
              </ul>

              <strong>Advanced Search:</strong>
              <ul>
                <li>Algolia</li>
                <li>Searchspring (roadmap)</li>
                <li>XO (roadmap)</li>
                <li>Syte (roadmap)</li>
              </ul>

              <strong>Product Information Management (PIM):</strong>
              <ul>
                <li>Akeneo</li>
              </ul>

              <strong>Marketing Automation:</strong>
              <ul>
                <li>Klaviyo</li>
                <li>Ortto</li>
                <li>Dot Digital</li>
                <li>Omnisend</li>
              </ul>

              <strong>Customer Support:</strong>
              <ul>
                <li>Gorgias</li>
                <li>Zendesk</li>
              </ul>

              <strong>Reviews and User Generated Content:</strong>
              <ul>
                <li>Yotpo</li>
                <li>Trustpilot</li>
                <li>Reviews.io</li>
              </ul>

              <strong>Physical Locations:</strong>
              <ul>
                <li>Localisr.io</li>
              </ul>

              <p>
                Our team is fanatical about site speed and the agility of a
                composable commerce approach. If you need help to set up a
                headless architecture, we’d love to hear from you.
              </p>

              <p>
                <Button
                  target={true}
                  href="https://www.matterdesign.com.au/contact/"
                >
                  Contact the team at Matter.
                </Button>
              </p>
            </div>
          </div>
        </Container>
        <div className={styles.imageContainer}>
          <img
            alt={'Best of Breed tools'}
            src={toOptimizedImage('/how-to-use/logos@2x.png')}
          ></img>
        </div>
      </div>
    </Layout>
  );
};

export default HowToUsePage;
