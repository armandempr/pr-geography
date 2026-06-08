interface Props {
  question: string;
  choices: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  answered: string | null;
}

export default function QuizChoice({ question, choices, correctAnswer, onAnswer, answered }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold text-white leading-snug">{question}</p>
      <div className="grid grid-cols-2 gap-3">
        {choices.map(choice => {
          let style =
            'rounded-xl border-2 border-slate-700 bg-slate-800 text-slate-200 font-semibold py-4 px-3 text-sm text-center transition-all';
          if (answered) {
            if (choice === correctAnswer) {
              style = 'rounded-xl border-2 border-green-500 bg-green-900/50 text-green-300 font-semibold py-4 px-3 text-sm text-center';
            } else if (choice === answered) {
              style = 'rounded-xl border-2 border-red-500 bg-red-900/50 text-red-300 font-semibold py-4 px-3 text-sm text-center';
            } else {
              style = 'rounded-xl border-2 border-slate-700 bg-slate-800/50 text-slate-500 font-semibold py-4 px-3 text-sm text-center';
            }
          } else {
            style += ' hover:border-blue-500 hover:bg-blue-900/30 active:scale-[0.97] cursor-pointer';
          }

          return (
            <button
              key={choice}
              onClick={() => !answered && onAnswer(choice)}
              className={style}
              disabled={!!answered}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
