import { TurnToPlay } from "./turn";
import { CastlingBoxes } from "./castlings";
import { Positions } from "./positions";
import classes from "../../css/controls.module.css";
import { Stack } from "@mantine/core";

export const Controls = () => {
  return (
    <Stack className={classes.controls}>
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
    </Stack>
  );
};
