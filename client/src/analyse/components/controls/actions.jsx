import { Group } from "@mantine/core";
import { FlipButton } from "src/common/components/controls/flip";
import { StartButton } from "src/common/components/controls/start";
import { Positions } from "./positions";
import { Navigate } from "src/common/components/navigation/navigate";

export const Actions = () => {
  return (
    <Group justify="center">
      <FlipButton />
      <StartButton />
      <Positions />
      <Navigate path="/editor" />
    </Group>
  );
};
