"use client"
import { getRandomAnswer as getRandomAnswerApi, shuffleArray, getQuestions, updateUserScore } from "@/utils/func";
import { useEffect } from "react";
import { Badge } from "../shadcn-component/badge";
import { Label } from "../shadcn-component/label";
import { Resume } from "./resume";
import { FilterSelector } from "./filter-selector";
import { Checkbox } from "../shadcn-component/checkbox";
import { Button } from "../shadcn-component/button";
import { toast } from "react-hot-toast";
import { Question } from "@/types/db";
import { useState } from "react";
import { AddAndRemoveButton } from "../button/add-and-remove-button";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";

type MyAnswersVSTheAnswers = { myAnswers: string[], theAnswers: string[], questions: string[] };

const answerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

export const SinglePlayerMode = () => {
  const { data: session } = authClient.useSession();
  const [startGame, setStartGame] = useState(false);
  const [typeId, setTypeId] = useState<string>("null");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [numberOfQuestion, setNumberOfQuestion] = useState(10);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [checkedAnswer, setCheckedAnswer] = useState<string[]>([]);
  const [randomAnswer, setRandomAnswer] = useState<string[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [myAnswers, setMyAnswers] = useState<MyAnswersVSTheAnswers>({ myAnswers: [], theAnswers: [], questions: [] });

  useEffect(() => {
    if (questions.length === 0) return;
    const question = questions[currentQuestionCount];
    if (!question) return;

    const fetchRandomAnswer = async () => {
      setRandomAnswer([]);
      setCheckedAnswer([]);
      const wrongAnswers = await getRandomAnswerApi();

      const answers: string[] = shuffleArray([
        question.Answer,
        ...wrongAnswers.map((a: { Answer: string }) => a.Answer),
      ]);

      setRandomAnswer(answers);
    };

    fetchRandomAnswer();
  }, [currentQuestionCount, questions]);

  const handleStart = async () => {
    setQuestionsLoading(true);
    const qs = await getQuestions(numberOfQuestion, typeId === "null" ? null : typeId);
    setQuestions(qs);
    setMyAnswers({ myAnswers: [], theAnswers: [], questions: qs.map((q: Question) => q.question) });
    setCurrentQuestionCount(0);
    setCurrentScore(0);
    setIsGameFinished(false);
    setQuestionsLoading(false);
    setStartGame(true);
  };

  const question = questions[currentQuestionCount];

  const handleSubmit = async () => {
    if (checkedAnswer.length === 1 && checkedAnswer[0] === question.Answer) {
      setCurrentScore((prev) => prev + question.Score);
      toast.success("Correct answer!");
    } else {
      toast.error("Wrong answer!");
    }

    let myCurrentAnswers: string = "NO ANSWER";

    if (checkedAnswer.length !== 0) {
      myCurrentAnswers = checkedAnswer[0];
    }

    setMyAnswers((prev) =>
      ({ myAnswers: [...prev.myAnswers, myCurrentAnswers],
        theAnswers: [...prev.theAnswers, question.Answer], questions: prev.questions })
    );

    if (currentQuestionCount < questions.length - 1) {
      setCurrentQuestionCount((prev) => prev + 1);
    } else {
      toast.success(`Thanks for playing! Your score is ${currentScore}pts.`);
      await updateUserScore(currentScore, session?.user.id || "");
      setIsGameFinished(true);
    }
  };

  const handleBack = () => {
    setIsGameFinished(false);
    setStartGame(false);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-lg mx-auto px-4 pb-8">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-center">Single player mode</h2>

      {!startGame && !questionsLoading && (
        <div className="w-full rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <FilterSelector setTypeId={setTypeId} typeId={typeId} />
            <p className="text-sm text-muted-foreground">Number of questions</p>
            <div className="flex flex-row items-center gap-4">
              <span className="text-lg font-semibold min-w-[1.5rem] text-center">{numberOfQuestion}</span>
              <AddAndRemoveButton setNumberOfQuestion={setNumberOfQuestion} />
            </div>
            <Button onClick={handleStart}>
              Start
            </Button>
          </div>
        </div>
      )}

      {questionsLoading && (
        <div className="flex justify-center py-12">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {startGame && !questionsLoading && !isGameFinished && question && (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                layout
                transition={{ duration: 0.3 }}
                style={{ width: `${((currentQuestionCount + 1) / questions.length) * 100}%` }}
              />
            </div>
            <motion.span
              key={currentScore}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold shrink-0 tabular-nums"
            >
              {currentScore}pts
            </motion.span>
          </div>

          <form
            className="flex flex-col gap-4 justify-center items-center w-full"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionCount}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4 items-center w-full"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {question.typeId?.split("-")[1]?.toUpperCase() || "MISC"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentQuestionCount + 1} / {questions.length}
                  </span>
                </div>
                <p className="text-lg text-center font-medium">{question.question}</p>

                <ul className="flex flex-col gap-3 w-full max-w-md">
                  {randomAnswer.map((answer: string, i) => (
                    <motion.div
                      key={`sp-answer-${i}`}
                      custom={i}
                      variants={answerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/50 has-[:checked]:border-primary"
                    >
                      <Checkbox
                        id={`sp-${i}`}
                        checked={checkedAnswer.includes(answer)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCheckedAnswer((prev) => [...prev, answer]);
                          } else {
                            setCheckedAnswer((prev) => prev.filter((a) => a !== answer));
                          }
                        }}
                      />
                      <Label htmlFor={`sp-${i}`} className="text-md cursor-pointer flex-1">
                        {answer}
                      </Label>
                    </motion.div>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <Button type="submit" className="self-center">
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentQuestionCount((p) => p + 1)}
                    disabled={currentQuestionCount === questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      )}

      {isGameFinished && (
        <Resume myAnswers={myAnswers.myAnswers} theAnswers={myAnswers.theAnswers} questions={myAnswers.questions} onBack={handleBack} />
      )}
    </div>
  );
};
