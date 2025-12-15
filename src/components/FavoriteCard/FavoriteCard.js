import React, { useState } from 'react';

import Drawer from '../Drawer';
import QuickView from '../QuickView';

import * as styles from './FavoriteCard.module.css';
import { toOptimizedImage } from '../../helpers/general';

const FavoriteCard = (props) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const { color, size, img, alt, showConfirmDialog, name, meta } = props;
  return (
    <div className={styles.root}>
      <div>
        <div className={styles.imageContainer}>
          <img src={toOptimizedImage(img)} alt={alt} />
        </div>
        <div className={styles.metaContainer}>
          {name && <span className={styles.itemName}>{name}</span>}
          {meta?.length > 0 && (
            <span className={styles.metaLine}>{meta.join(' • ')}</span>
          )}
          {color && <span>Color: {color}</span>}
          {size && <span>Size: {size}</span>}
        </div>
      </div>
      <div className={styles.actionContainer}>
        <span role={'presentation'} onClick={() => setShowQuickView(true)}>
          Edit
        </span>
        <span role={'presentation'} onClick={showConfirmDialog}>
          Remove
        </span>
      </div>

      <Drawer visible={showQuickView} close={() => setShowQuickView(false)}>
        <QuickView
          buttonTitle={'update favorite'}
          close={() => setShowQuickView(false)}
        />
      </Drawer>
    </div>
  );
};

export default FavoriteCard;
