import clsx from "clsx";
import { TurnToPlay } from "./turn";
import { CastlingBoxes } from "./castlings";
import { Positions } from "./positions";
import { EditorActions } from "./actions";
import classes from "./controls.module.css";
import { Stack } from "@mantine/core";

export const Controls = () => {
  return (
    <Stack
      className={clsx([
        "controls",
        classes.controls,
        "mantine-visible-from-sm",
      ])}
    >
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
      <EditorActions />
    </Stack>
  );
};
