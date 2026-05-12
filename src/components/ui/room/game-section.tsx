"use client";
import { Resume } from "./resume";
import { updateUserScore, getQuestions } from "@/utils/func";
import { Badge } from "../shadcn-component/badge";
import { toast } from "react-hot-toast";

import { Question, Room } from "@/types/db";
import { Checkbox } from "../shadcn-component/checkbox";
import { Label } from "../shadcn-component/label";
import { Separator } from "../shadcn-component/separator";
import { Button } from "../shadcn-component/button";
import { useEffect, useState } from "react";
import { getRandomAnswer as getRandomAnswerApi, shuffleArray } from "@/utils/func";
import { Session } from "@/types/better-auth";

type GameSectionProps = {
  room: Room | undefined;
  session: Session
};

type MyAnswersVSTheAnswers = { myAnswers: string[], theAnswers: string[], questions: string[] };

export const GameSection = ({ room, session }: GameSectionProps) => {
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
      setIsGameFinished(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {room && <h2 className="text-2xl font-bold text-center">{room.title}</h2>}

      <Separator />

      <form
        className="flex flex-col gap-4 justify-center items-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        hidden={isGameFinished}
      >
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="self-center">
            {question.typeId?.split("-")[1]?.toUpperCase() || "MISC"}
          </Badge>
          <p className="text-lg text-center font-medium">{question.question}</p>
        </div>

        <ul className="flex flex-col gap-3">
          {randomAnswer.map((answer: string, id) => (
            <div className="flex items-center gap-3" key={id}>
              <Checkbox
                id={String(id)}
                checked={checkedAnswer.includes(answer)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCheckedAnswer((prev) => [...prev, answer]);
                  } else {
                    setCheckedAnswer((prev) => prev.filter((a) => a !== answer));
                  }
                }}
              />
              <Label htmlFor={String(id)} className="text-md">
                {answer}
              </Label>
            </div>
          ))}
        </ul>

        <Button type="submit" className="self-center">
          Submit
        </Button>
        <Button
          onClick={() => setCurrentQuestionCount((p) => p + 1)}
          disabled={currentQuestionCount === questions.length - 1}
        >
          Next question
        </Button>
      </form>

      { isGameFinished ? <Resume myAnswers={myAnswers.myAnswers} theAnswers={myAnswers.theAnswers} questions={myAnswers.questions}/> : null }
    </div>
  );
};
