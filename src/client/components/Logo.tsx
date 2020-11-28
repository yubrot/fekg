import Icon24 from './Icon24';

export default function Logo(): React.ReactElement {
  const title = 'Fast Enough Kusokora Generator'.split(/ /);
  const ruby = '十分に 高速な クソコラ ジェネレータ'.split(/ /);

  return (
    <div
      className="shadow-md text-white"
      style={{ background: 'linear-gradient(to bottom right, #3182ce, #bee3f8)' }}
    >
      <div className="cc relative p-16 flex justify-center items-center">
        <Icon24 name="fekg" className="w-24 h-24 text-white" />
        <div className="font-mono text-3xl font-bold border-l border-white pl-4 ml-12">
          {title.map((title, i) => (
            <div key={i} className="py-1">
              <ruby>
                {title}
                <rt className="text-xs text-bluegray-200">{ruby[i]}</rt>
              </ruby>
              <br />
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 py-2 px-6 flex items-center space-x-2">
          <div>Sign-in to create a template</div>
          <Icon24 name="arrow-up" className="w-6 h-6" />
        </div>
        <div className="absolute left-0 bottom-0 py-2 px-6 flex items-center space-x-2">
          <Icon24 name="arrow-down" className="w-6 h-6" />
          <div>Explore templates</div>
        </div>
      </div>
    </div>
  );
}
