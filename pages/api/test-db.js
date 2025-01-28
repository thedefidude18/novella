import { testConnection } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.status(200).json({ status: 'success', message: 'Database connection successful' });
    } else {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database test failed',
      error: error.message 
    });
  }
}