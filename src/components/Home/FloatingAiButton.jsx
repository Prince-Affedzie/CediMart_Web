// src/components/Home/FloatingAiButton.jsx
import Link from 'next/link';

export default function FloatingAiButton() {
  return (
    <Link href="/ai-assistant" className="floating-ai-btn" aria-label="Find faster with CediAi">
      <span className="floating-ai-sparkle">✦</span>
      <span className="floating-ai-label">Shop faster with CediAi</span>
    </Link>
  );
}