import { Group } from "@mantine/core";
import { FlipButton } from "src/common/components/controls/flip";
import { StartButton } from "src/common/components/controls/start";
import { ClearButton } from "./clear";
import { Navigate } from "src/common/components/navigation/navigate";

export const EditorActions = () => {
  return (
    <Group justify="center">
      <FlipButton />
      <StartButton />
      <ClearButton />
      <Navigate path="/analysis" />
    </Group>
  );
};
