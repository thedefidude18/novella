import { initDb } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await initDb();
    res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize database',
      error: error.message 
    });
  }
}