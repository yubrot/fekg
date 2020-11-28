import { useRouter } from 'next/router';

export default function Search(): React.ReactElement {
  const router = useRouter();
  const text = join(router.query.t);

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-md bg-white shadow-md">
      Not implemented: {text}
    </div>
  );
}

function join(s?: string | string[]): string {
  return Array.isArray(s) ? s.join(' ') : s ?? '';
}
