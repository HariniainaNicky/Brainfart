"use client";
import { Resume } from "./resume";
import { updateUserScore, getQuestions, submitRoomScore } from "@/utils/func";
import { Badge } from "../shadcn-component/badge";
import { toast } from "react-hot-toast";

import { Question, Room } from "@/types/db";
import { Checkbox } from "../shadcn-component/checkbox";
import { Label } from "../shadcn-component/label";
import { Separator } from "../shadcn-component/separator";
import { Button } from "../shadcn-component/button";
import { createElement, useEffect, useState } from "react";
import { getRandomAnswer as getRandomAnswerApi, shuffleArray } from "@/utils/func";
import { topicIcon, topicLabel } from "@/lib/topics";
import { Session } from "@/types/better-auth";
import { motion, AnimatePresence } from "motion/react";

type GameSectionProps = {
  room: Room | undefined;
  session: Session;
  onBack?: () => void;
};

type MyAnswersVSTheAnswers = { myAnswers: string[], theAnswers: string[], questions: string[] };

const answerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

export const GameSection = ({ room, session, onBack }: GameSectionProps) => {
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [checkedAnswer, setCheckedAnswer] = useState<string[]>([]);
  const [randomAnswer, setRandomAnswer] = useState<string[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [myAnswers, setMyAnswers] = useState<MyAnswersVSTheAnswers>({ myAnswers: [], theAnswers: [], questions: [] });

  useEffect(() => {
    const fetchGameQuestions = async () => {
      setQuestionsLoading(true);
      if (room?.questionCount) {
        const qs = await getQuestions(room.questionCount, room.questionTypeId || null);
        setQuestions(qs);
      } else if (room?.questions?.length) {
        setQuestions(room.questions);
      }
      setQuestionsLoading(false);
    };
    fetchGameQuestions();
  }, [room?.id]);

  useEffect(() => {
    if (questions.length === 0) return;
    const question = questions[currentQuestionCount];
    if (!question) return;

    const fetchChoices = async () => {
      setRandomAnswer([]);
      setCheckedAnswer([]);
      if (question.options && question.options.length >= 2) {
        setRandomAnswer(shuffleArray(question.options));
        return;
      }
      const wrongAnswers = await getRandomAnswerApi();

      const answers: string[] = shuffleArray([
        question.Answer,
        ...wrongAnswers.map((a: { Answer: string }) => a.Answer),
      ]);

      setRandomAnswer(answers);
    };

    fetchChoices();
  }, [currentQuestionCount, questions]);

  if (questionsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

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
        theAnswers: [...prev.theAnswers, question.Answer], questions: [...prev.questions, question.question] })
    );

    if (currentQuestionCount < questions.length - 1) {
      setCurrentQuestionCount((prev) => prev + 1);
    } else {
      toast.success(`Thanks for playing! Your score is ${currentScore}pts... we will update your ranking soon.`);
      await updateUserScore(currentScore, session?.user.id || "");
      await submitRoomScore(room?.id || "", session?.user.id || "", currentScore, true);
      setIsGameFinished(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {room && <h2 className="text-2xl font-bold text-center">{room.title}</h2>}

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

      <Separator />

      <form
        className="flex flex-col gap-4 justify-center items-center w-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        hidden={isGameFinished}
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
              <Badge variant="outline" className="gap-1.5">
                {createElement(topicIcon(question.typeId), { className: "size-3.5" })}
                {topicLabel(question.typeId)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentQuestionCount + 1} / {questions.length}
              </span>
            </div>
            <p className="text-lg text-center font-medium">{question.question}</p>

            <ul className="flex flex-col gap-3 w-full max-w-md">
              {randomAnswer.map((answer: string, i) => (
                <motion.div
                  key={`answer-${i}`}
                  custom={i}
                  variants={answerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/50 has-[:checked]:border-primary"
                >
                  <Checkbox
                    id={String(i)}
                    checked={checkedAnswer.includes(answer)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCheckedAnswer((prev) => [...prev, answer]);
                      } else {
                        setCheckedAnswer((prev) => prev.filter((a) => a !== answer));
                      }
                    }}
                  />
                  <Label htmlFor={String(i)} className="text-md cursor-pointer flex-1">
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

      { isGameFinished ? <Resume myAnswers={myAnswers.myAnswers} theAnswers={myAnswers.theAnswers} questions={myAnswers.questions} onBack={onBack}/> : null }
    </div>
  );
};
