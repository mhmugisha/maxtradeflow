import { getAllArticles } from '../../lib/articles';
import EducationList from './EducationList';

export default async function EducationPage() {
  const articles = await getAllArticles();
  return (
    <main>
      <div style={{padding: '40px 24px', textAlign: 'center', background: '#111e2e'}}>
        <h1 style={{fontSize: '32px', color: '#c8dce8', marginBottom: '12px'}}>Education & Guides</h1>
        <p style={{color: '#3a6070'}}>Learn trading strategies, how to use our tools, and market fundamentals</p>
      </div>
      <EducationList articles={articles} />
    </main>
  );
}
