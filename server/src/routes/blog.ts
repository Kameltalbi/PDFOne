import express from 'express';
import { getPublishedPost, listPublishedPosts } from '../services/blog.js';

const router = express.Router();

function langOf(req: express.Request) {
  const query = typeof req.query.lang === 'string' ? req.query.lang : '';
  return query || String(req.headers['accept-language'] || 'en');
}

router.get('/', async (req, res) => {
  try {
    const posts = await listPublishedPosts(langOf(req));
    return res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('Blog list error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger le blog.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await getPublishedPost(req.params.slug, langOf(req));
    if (!post) return res.status(404).json({ success: false, error: 'Article introuvable.' });
    return res.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog post error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger l’article.' });
  }
});

export default router;
