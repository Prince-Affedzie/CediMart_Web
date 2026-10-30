// src/app/feed/page.js
import FeedClient from './FeedClient';

export const metadata = {
  title: 'CediMart Feed – videos, deals & events',
  description:
    'Watch short videos from vendors and businesses,events, hacks and deals on CediMart.',
  alternates: { canonical: '/feed' },
};

export default function FeedPage() {
  return <FeedClient />;
}