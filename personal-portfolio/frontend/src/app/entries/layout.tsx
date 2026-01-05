import { Navigation } from '@/components/Navigation';

export default function EntriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
