import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";

export const History = observer(({ size }) => {
  const pageStore = usePageStore();
  const actions = [
    {
      icon: IconChevronsLeft,
      action: () => pageStore.jumpFirst(),
      key: "start",
    },
    { icon: IconChevronLeft, action: () => pageStore.jumpPrev(), key: "undo" },
    { icon: IconChevronRight, action: () => pageStore.jumpNext(), key: "redo" },
    { icon: IconChevronsRight, action: () => pageStore.jumpLast(), key: "end" },
  ];

  return (
    <>
      {actions.map(({ icon: Icon, action, key }) => (
        <ActionIcon key={key} className="icon" size={size} onClick={action}>
          <Icon size={60} stroke={1.2} />
        </ActionIcon>
      ))}
    </>
  );
});
