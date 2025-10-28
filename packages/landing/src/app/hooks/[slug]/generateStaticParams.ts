import { demoComponents } from '../demoComponents';

export async function generateStaticParams() {
  const slugs = Object.keys(demoComponents);
  return slugs.map((slug) => ({ slug }));
}
