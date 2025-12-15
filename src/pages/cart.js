import { Link } from 'gatsby';
import React from 'react';
import { navigate } from 'gatsby';

import Brand from '../components/Brand';
import CartItem from '../components/CartItem';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Icon from '../components/Icons/Icon';
import OrderSummary from '../components/OrderSummary';
import { isAuth } from '../helpers/general';

import * as styles from './cart.module.css';

const CartPage = (props) => {
  const sampleCartItem = {
    image: '/products/pdp1.jpeg',
    alt: '',
    name: 'Lambswool Crew Neck Jumper',
    price: 220,
    color: 'Anthracite Melange',
    size: 'XS',
  };

  if (!isAuth()) {
    return (
      <div className={styles.guardContainer}>
        <Brand />
        <div className={styles.guardCard}>
          <h3>Bag locked</h3>
          <p>Please log in to view or update your bag.</p>
          <button className={styles.guardButton} onClick={() => navigate('/login')}>
            Go to login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.contentContainer}>
        <Container size={'large'} spacing={'min'}>
          <div className={styles.headerContainer}>
            <div className={styles.shoppingContainer}>
              <Link className={styles.shopLink} to={'/shop'}>
                <Icon symbol={'arrow'}></Icon>
                <span className={styles.continueShopping}>
                  Continue Shopping
                </span>
              </Link>
            </div>
            <Brand />
            <div className={styles.loginContainer}>
              <Link to={'/login'}>Login</Link>
            </div>
          </div>
          <div className={styles.summaryContainer}>
            <h3>My Bag</h3>
            <div className={styles.cartContainer}>
              <div className={styles.cartItemsContainer}>
                <CartItem {...sampleCartItem} />
                <CartItem {...sampleCartItem} />
              </div>
              <OrderSummary />
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
