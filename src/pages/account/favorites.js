import React, { useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import * as styles from './favorites.module.css';

import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import Container from '../../components/Container';
import FavoriteCard from '../../components/FavoriteCard/FavoriteCard';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal';

import { isAuth, toOptimizedImage } from '../../helpers/general';
import { generateMockProductData } from '../../helpers/mock';

const FAVORITES_STORAGE_KEY = 'favorites';

const FavoritesPage = () => {
  const [canRenderPage, setCanRenderPage] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState();
  const recommendations = generateMockProductData(4, 'featured');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAuth() === false) {
      navigate('/login');
      return;
    }

    const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    setCanRenderPage(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  if (!canRenderPage) return null;

  const removeFavorite = () => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== selectedFavorite?.id));
    setShowDelete(false);
  };

  const addFavorite = (product) => {
    setFavorites((prev) => {
      if (prev.find((fav) => fav.id === product.name)) return prev;

      const nextFavorite = {
        id: product.name,
        name: product.name,
        img: product.image,
        alt: product.alt || product.name,
        meta: product.tags,
      };

      return [...prev, nextFavorite];
    });
  };

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'}>
          <Breadcrumbs
            crumbs={[
              { link: '/', label: 'Home' },
              { link: '/account/favorites', label: 'Favorites' },
            ]}
          />
          <h1>Favorites</h1>
          {favorites.length === 0 && (
            <p className={styles.emptyState}>
              Keep this space blank until you intentionally save something. We&apos;ll remember your picks until you remove them.
            </p>
          )}
          <div className={styles.favoriteListContainer}>
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                {...favorite}
                showConfirmDialog={() => {
                  setSelectedFavorite(favorite);
                  setShowDelete(true);
                }}
              />
            ))}
          </div>

          <div className={styles.recommendations}>
            <h3>Recommended essentials</h3>
            <p className={styles.recommendationCopy}>
              Add items you love without leaving this page. Nothing resets unless you delete it.
            </p>
            <div className={styles.recommendationGrid}>
              {recommendations.map((product) => {
                const alreadySaved = favorites.some((fav) => fav.id === product.name);

                return (
                  <div className={styles.recommendationCard} key={product.name}>
                    <div className={styles.recommendationImage}>
                      <img src={toOptimizedImage(product.image)} alt={product.alt} />
                    </div>
                    <div className={styles.recommendationMeta}>
                      <span className={styles.recommendationName}>{product.name}</span>
                      <span className={styles.recommendationTags}>{product.tags?.join(' • ')}</span>
                    </div>
                    <Button
                      fullWidth
                      level={alreadySaved ? 'secondary' : 'primary'}
                      onClick={() => addFavorite(product)}
                      disabled={alreadySaved}
                    >
                      {alreadySaved ? 'Saved' : 'Save to favorites'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </div>
      <Modal visible={showDelete} close={() => setShowDelete(false)}>
        <div className={styles.confirmDeleteContainer}>
          <h4>Remove from Favorites?</h4>
          <p>
            Are you sure you want to remove this from your favorites? You cannot undo this action once you press <strong>
              'Delete'
            </strong>
          </p>
          <div className={styles.actionContainer}>
            <Button onClick={removeFavorite} level={'primary'}>
              Delete
            </Button>
            <Button onClick={() => setShowDelete(false)} level={'secondary'}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default FavoritesPage;
