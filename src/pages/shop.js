import React, { useState, useEffect } from 'react';
import * as styles from './shop.module.css';

import Banner from '../components/Banner';
import Breadcrumbs from '../components/Breadcrumbs';
import CardController from '../components/CardController';
import Container from '../components/Container';
import Chip from '../components/Chip';
import Icon from '../components/Icons/Icon';
import Layout from '../components/Layout';
import LayoutOption from '../components/LayoutOption';
import ProductCardGrid from '../components/ProductCardGrid';
import { generateMockProductData } from '../helpers/mock';
import Button from '../components/Button';
import Config from '../config.json';

const ShopPage = (props) => {
  const [showFilter, setShowFilter] = useState(false);
  const [activeDomain, setActiveDomain] = useState('tech');
  const data = generateMockProductData(6, 'featured');
  const techData = generateMockProductData(4, 'tech');
  const apparelData = generateMockProductData(4, 'apparel');

  useEffect(() => {
    window.addEventListener('keydown', escapeHandler);
    return () => window.removeEventListener('keydown', escapeHandler);
  }, []);

  const escapeHandler = (e) => {
    if (e?.keyCode === undefined) return;
    if (e.keyCode === 27) setShowFilter(false);
  };

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'} spacing={'min'}>
          <div className={styles.breadcrumbContainer}>
            <Breadcrumbs
              crumbs={[
                { link: '/', label: 'Home' },
                { link: '/', label: 'Gear' },
                { label: 'Featured Systems' },
              ]}
            />
          </div>
        </Container>
        <Banner
          maxWidth={'650px'}
          name={`Signal-first essentials`}
          subtitle={
            'Modular hubs, wearable bands, and ambient lighting tuned for builders who want clean setups without distractions.'
          }
        />
        <Container size={'large'} spacing={'min'}>
          <div className={styles.metaContainer}>
            <span className={styles.itemCount}>8 items</span>
            <div className={styles.controllerContainer}>
              <div
                className={styles.iconContainer}
                role={'presentation'}
                onClick={() => setShowFilter(!showFilter)}
              >
                <Icon symbol={'filter'} />
                <span>Filters</span>
              </div>
              <div
                className={`${styles.iconContainer} ${styles.sortContainer}`}
              >
                <span>Sort by</span>
                <Icon symbol={'caret'} />
              </div>
            </div>
          </div>
          <CardController
            closeFilter={() => setShowFilter(false)}
            visible={showFilter}
            filters={Config.filters}
          />
          <div className={styles.chipsContainer}>
            <Chip name={'Tech'} active={activeDomain === 'tech'} onClick={() => setActiveDomain('tech')} />
            <Chip name={'Apparel'} active={activeDomain === 'apparel'} onClick={() => setActiveDomain('apparel')} />
          </div>
          <div className={styles.productContainer}>
            <span className={styles.mobileItemCount}>8 items</span>
            <div className={styles.domainGrid}>
              <div className={styles.domainColumn}>
                <h3>Tech</h3>
                <p className={styles.domainCopy}>
                  Browse devices, wearables, and accessories built for the lab and the street.
                </p>
                <div className={styles.categoryRow}>
                  <Chip name={'Male Tech'} />
                  <Chip name={'Female Tech'} />
                  <Chip name={'Tech Accessories'} />
                </div>
                <ProductCardGrid data={activeDomain === 'tech' ? techData : data}></ProductCardGrid>
              </div>
              <div className={styles.domainColumn}>
                <h3>Apparel</h3>
                <p className={styles.domainCopy}>
                  Layers, outerwear, and accessories optimized for motion and comfort.
                </p>
                <div className={styles.categoryRow}>
                  <Chip name={'Male Apparel'} />
                  <Chip name={'Female Apparel'} />
                  <Chip name={'Apparel Accessories'} />
                </div>
                <ProductCardGrid data={activeDomain === 'apparel' ? apparelData : data}></ProductCardGrid>
              </div>
            </div>
          </div>
          <div className={styles.loadMoreContainer}>
            <span>6 of 456</span>
            <Button fullWidth level={'secondary'}>
              LOAD MORE
            </Button>
          </div>
        </Container>
      </div>

      <LayoutOption />
    </Layout>
  );
};

export default ShopPage;
