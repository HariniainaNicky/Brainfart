"use client";

import Image from "next/image";
import { useState, forwardRef } from "react";
import { Button } from "../shadcn-component/button";
import { Spinner } from "../shadcn-component/spinner";

type AvatarPropsType = {
  src: string ;
  alt: string ;
  size?: number;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
};

export const Avatar = forwardRef<HTMLButtonElement, AvatarPropsType & React.ComponentPropsWithoutRef<"button">>(
  ({ loading = false, src, alt = "avatar", size = 48, onClick, className, ...props }, ref) => {
  const letter = alt.charAt(0).toUpperCase();

  return (
    <Button
      ref={ref}
      variant="secondary"
      className={`overflow-hidden rounded-full flex items-center justify-center border font-bold p-0 hover:cursor-pointer shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      {...props}
    >
      {src && !loading ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center rounded-full"
        />
      ) : !loading ? (
        <span className="text-lg">{letter}</span>
      ) : (
        <Spinner />
      )}
    </Button>
  );
});
Avatar.displayName = "Avatar";
