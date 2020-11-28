import Icon20 from './Icon20';

export interface Props {}

export default function Footer({}: Props): React.ReactElement {
  return (
    <div className="bg-bluegray-200 shadow-inner">
      <footer className="cc flex justify-center pt-4 px-8 pb-16">
        <a
          href="https://github.com/yubrot/fekg"
          className="block text-sm text-bluegray-400 hover:text-blue-400 transition"
        >
          <Icon20 name="github" className="w-8 h-8" />
        </a>
      </footer>
    </div>
  );
}