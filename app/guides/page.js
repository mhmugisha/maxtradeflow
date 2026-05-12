import { getArticlesByCategory } from '../../lib/articles';
import EducationList from '../education/EducationList';

export default async function GuidesPage() {
  const articles = await getArticlesByCategory('guide', 100);
  
  const CATEGORIES = {
    all: 'All',
    'tool-guides': 'Tool Guides',
    'how-it-works': 'How It Works',
  };

  return (
    <main>
      <div style={{padding: '40px 24px', textAlign: 'center', background: '#111e2e'}}>
        <h1 style={{fontSize: '32px', color: '#c8dce8', marginBottom: '12px'}}>Tool Guides & How It Works</h1>
        <p style={{color: '#3a6070'}}>Learn how MaxTradeFlow tools work and how to read our signals</p>
      </div>
      <EducationList articles={articles} categoryFilter="guide" tabFilter={true} />
    </main>
  );
}
