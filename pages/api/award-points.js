import { addPoints } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { did, points, reason } = req.body;

  if (!did || points === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: did or points'
    });
  }

  try {
    const newTotal = await addPoints(did, points, reason);
    
    return res.status(200).json({
      success: true,
      did,
      points: newTotal
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to award points'
    });
  }
}