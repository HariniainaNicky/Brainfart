import { CheckCircle2, XCircle } from "lucide-react";

type ResumeProps = {
  myAnswers: string[];
  theAnswers: string[];
  questions: string[];
};

export const Resume = ({ myAnswers, theAnswers, questions }: ResumeProps) => {
  const correctCount = myAnswers.filter(
    (answer, i) => answer === theAnswers[i],
  ).length;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-center">
        <p className="text-lg font-bold">
          {correctCount}/{questions.length} correct
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const isCorrect = myAnswers[index] === theAnswers[index];
          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2"
            >
              <p className="text-sm font-medium leading-snug">{question}</p>

              <div
                className={`flex items-center gap-2 text-sm ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <XCircle size={16} className="shrink-0" />
                )}
                <span className="text-muted-foreground">Your answer:</span>
                <span className="font-medium truncate">{myAnswers[index]}</span>
              </div>

              {!isCorrect && (
                <div className="flex items-center gap-2 text-sm text-green-600 pl-6">
                  <span className="text-muted-foreground">Correct:</span>
                  <span className="font-medium">{theAnswers[index]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
