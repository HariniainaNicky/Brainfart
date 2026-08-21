import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "../shadcn-component/button";

type ResumeProps = {
  myAnswers: string[];
  theAnswers: string[];
  questions: string[];
  onBack?: () => void;
};

export const Resume = ({ myAnswers, theAnswers, questions, onBack }: ResumeProps) => {
  const correctCount = myAnswers.filter(
    (answer, i) => answer === theAnswers[i],
  ).length;

  const accuracy = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-4xl font-bold tabular-nums tracking-tight">
          {correctCount}
          <span className="text-muted-foreground font-normal">/{questions.length}</span>
        </p>
        <p className="text-sm text-muted-foreground">{accuracy}% accuracy</p>
        <p className="text-xs font-medium text-muted-foreground">
          {correctCount === questions.length
            ? "Perfect score!"
            : correctCount === 0
              ? "Keep practicing!"
              : `${questions.length - correctCount} to review`}
        </p>
      </div>

      {onBack && (
        <Button
          variant="outline"
          className="gap-2 self-center"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to details
        </Button>
      )}

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
