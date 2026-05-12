import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import EducationList from './EducationList';
import styles from './education-index.module.css';

export async function generateMetadata() {
  return {
    title: 'Education & Guides - MaxTradeFlow',
    description:
      'Learn trading strategies, how to use our tools, and understand market fundamentals with our comprehensive education and guide articles.',
    keywords: 'trading education, trading guides, market analysis, financial guides',
  };
}

export default async function EducationIndexPage() {
  const allArticles = await getAllArticles();
  const educationArticles = allArticles.filter(
    (article) =>
      article.category === 'education' ||
      article.category === 'guide' ||
      article.category === 'overview'
  );

  return (
    <div className={styles.educationPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Education & Guides</h1>
          <p>Learn trading strategies, how to use our tools, and market fundamentals</p>
        </div>
      </header>

      <div className={styles.container}>
        <EducationList articles={educationArticles} />
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Trading?</h2>
          <p>Access our Smart Asset Bot and start receiving real-time trading signals</p>
          <Link href="/screener" className={styles.ctaButton}>
            Open the Screener
          </Link>
        </div>
      </section>
    </div>
  );
}
