const isBrowser = typeof window !== 'undefined';

async function initDb() {
  if (!isBrowser) {
    console.log('IndexedDB not available - running in non-browser context');
    return false;
  }

  const { openDB } = await import('idb');

  try {
    const db = await openDB('youbuidl_db', 1, {
      upgrade(db) {
        // Create user_points store if it doesn't exist
        if (!db.objectStoreNames.contains('user_points')) {
          const userPointsStore = db.createObjectStore('user_points', { keyPath: 'did' });
          userPointsStore.createIndex('points', 'points');
        }

        // Create points_history store if it doesn't exist
        if (!db.objectStoreNames.contains('points_history')) {
          const historyStore = db.createObjectStore('points_history', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          historyStore.createIndex('did', 'did');
          historyStore.createIndex('created_at', 'created_at');
        }
      }
    });

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

async function getUserPoints(did) {
  if (!isBrowser || !did) return 0;
  
  try {
    const { openDB } = await import('idb');
    const db = await openDB('youbuidl_db');
    const points = await db.get('user_points', did);
    return points?.points || 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
}

async function addPoints(did, amount, reason = 'general') {
  if (!isBrowser || !did) return 0;

  try {
    const { openDB } = await import('idb');
    const db = await openDB('youbuidl_db');
    
    const tx = db.transaction(['user_points', 'points_history'], 'readwrite');
    
    // Update or create user points
    const userStore = tx.objectStore('user_points');
    const currentPoints = await userStore.get(did);
    const newTotal = (currentPoints?.points || 0) + amount;
    
    await userStore.put({
      did,
      points: newTotal,
      updated_at: new Date().toISOString()
    });

    // Add history record
    const historyStore = tx.objectStore('points_history');
    await historyStore.add({
      did,
      points_change: amount,
      reason,
      created_at: new Date().toISOString()
    });

    await tx.done;
    
    console.log(`Added ${amount} points to ${did}. New total: ${newTotal}`);
    return newTotal;
  } catch (error) {
    console.error('Error adding points:', error);
    return 0;
  }
}

async function getPointsHistory(did) {
  if (!isBrowser || !did) return [];

  try {
    const { openDB } = await import('idb');
    const db = await openDB('youbuidl_db');
    const tx = db.transaction('points_history', 'readonly');
    const index = tx.store.index('did');
    const history = await index.getAll(did);
    return history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting points history:', error);
    return [];
  }
}

async function getLeaderboard(limit = 10) {
  if (!isBrowser) return [];

  try {
    const { openDB } = await import('idb');
    const db = await openDB('youbuidl_db');
    const tx = db.transaction('user_points', 'readonly');
    const store = tx.store;
    const all = await store.getAll();
    
    return all
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

export {
  initDb,
  getUserPoints,
  addPoints,
  getPointsHistory,
  getLeaderboard
};