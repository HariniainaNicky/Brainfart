"use client";
import { FilterSelector } from "./filter-selector";
import { TriviaCategorySection } from "./trivia-category-section";
import { FieldErrors, useForm } from "react-hook-form";
import { Input } from "../shadcn-component/input";
import { AddAndRemoveButton } from "../button/add-and-remove-button";
import { useState } from "react";
import { Button } from "../shadcn-component/button";
import toast from "react-hot-toast";
import { createRoom } from "@/utils/func";
import { useRouter } from "next/navigation";
import { ChronoTimingSelector } from "./chrono-timing-selector";

type FormValues = {
  title: string;
};

export const RoomCreationBodyCard = () => {
  const [loading, setLoading] = useState(false);
  const [numberOfQuestion, setNumberOfQuestion] = useState(10);
  const [chronoTiming, setChronoTiming] = useState(10);
  const [typeId, setTypeId] = useState<string>("null");
  const router = useRouter();

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
      await createRoom({
        title: data.title,
        questionTypeId: typeId === "null" ? null : typeId,
        questionCount: numberOfQuestion,
        chronoTiming,
      });
      router.push("/room");
    } catch (error) {
      console.log(error);
      toast.error(
        "Something went wrong while creating room, please try again later",
        { id: "create-room" },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    handleSubmit(createRoomHandler, onInvalidSubmit)();
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

      <TriviaCategorySection
        selectedTypeId={typeId === "null" ? null : typeId}
        onSelect={setTypeId}
      />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Questions:</span>
        <span className="text-lg font-semibold min-w-[1.5rem] text-center">{numberOfQuestion}</span>
        <AddAndRemoveButton setNumberOfQuestion={setNumberOfQuestion} />
      </div>

      <Button
        disabled={loading}
        onClick={handleCreate}
        className="w-full"
      >
        Create room
      </Button>
    </div>
  );
};
