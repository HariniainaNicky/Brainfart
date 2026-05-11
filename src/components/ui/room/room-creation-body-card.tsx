"use client";
import { FilterSelector } from "./filter-selector";
import { FieldErrors, useForm } from "react-hook-form";
import { Input } from "../shadcn-component/input";
import { User } from "@/types/db";
import { AddAndRemoveButton } from "../button/add-and-remove-button";
import { useState } from "react";
import { Button } from "../shadcn-component/button";
import { QuestionDisplayer } from "../question-answer/question-displayer";
import { Question } from "@/types/db";
import toast from "react-hot-toast";
import { createRoom, getQuestions } from "@/utils/func";
import { useRouter } from "next/navigation";
import { ChronoTimingSelector } from "./chrono-timing-selector";

type FormValues = {
  title: string;
  players: User[];
  numberOfQuestion: number;
  chronoTiming: number;
};

export const RoomCreationBodyCard = () => {
  const [generatedQuestion, setGeneratedQuestion] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [numberOfQuestion, setNumberOfQuestion] = useState(1);
  const [chronoTiming, setChronoTiming] = useState(10);
  const [typeId, setTypeId] = useState<string>("null");
  const router = useRouter();

  const generateQuestionsHandler = async () => {
    try {
      setLoading(true);
      const questions: Question[] = await getQuestions(numberOfQuestion, typeId);
      setGeneratedQuestion(questions);
    } catch (error) {
      console.log(error);
      toast.error(
        "Something went wrong while generating questions, please try again later",
        { id: "generate-questions" },
      );
    } finally {
      setLoading(false);
    }
  };

  const { handleSubmit, register, formState: { errors } } = useForm<FormValues>();

  const onInvalidSubmit = () => {
    const firstError = Object.values(errors)[0] as FieldErrors;
    if (firstError?.message) {
      toast.error("You must add a title", { id: "create-room-title-missing" });
    }
  }

  const createRoomHandler = async (data: FormValues) => {
    try {
      setLoading(true);
      if (generatedQuestion.length === 0) {
        toast.error("Please generate questions first", { id: "create-room" });
        setLoading(false);
        return;
      }
      const newData = { questions: generatedQuestion, ...data, chronoTiming: chronoTiming };
      await createRoom(newData);
      router.push("/room");
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(
        "Something went wrong while creating room, please try again later",
        { id: "create-room" },
      );
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-5 w-full">
      <Input
        placeholder="Choose a title"
        type="text"
        {...register("title" ,{required: "You must enter a title"})}
      />

      <div className="flex flex-wrap items-center gap-3">
        <ChronoTimingSelector setChronoTiming={setChronoTiming} chronoTiming={chronoTiming} />
        <FilterSelector setTypeId={setTypeId} typeId={typeId} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Questions:</span>
          <span className="text-lg font-semibold min-w-[1.5rem] text-center">{numberOfQuestion}</span>
          <AddAndRemoveButton setNumberOfQuestion={setNumberOfQuestion} />
        </div>

        <Button
          variant="secondary"
          disabled={loading}
          onClick={generateQuestionsHandler}
          className="w-full sm:w-auto"
        >
          Generate questions
        </Button>

        <QuestionDisplayer
          loading={loading}
          questions={generatedQuestion}
        />
      </div>

      <Button
        disabled={loading}
        onClick={handleSubmit(createRoomHandler, onInvalidSubmit)}
        className="w-full"
      >
        Create room
      </Button>
    </div>
  );
};
