import { useRef, useEffect } from "react";
import { usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import { TextInput } from "@mantine/core";
import classes from "src/common/css/fen.module.css";
import { action } from "mobx";

export const FenInput = observer(() => {
  const pageStore = usePageStore();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.value = pageStore.fen.current;

    return autorun(() => {
      if (inputRef.current) {
        inputRef.current.value = pageStore.fen.current;
      }
    });
  }, []);

  const onKeyDown = action((event) => {
    if (event.key === "Enter") {
      inputRef.current.blur();
    }
  });

  const onBlur = action(() => {
    const fen = inputRef.current.value;
    if (fen !== pageStore.fen.current && pageStore.fen.isValid(fen)) {
      pageStore.setFen(fen);
    } else {
      inputRef.current.value = pageStore.fen.current;
    }
  });

  return (
    <TextInput
      ref={inputRef}
      className="copyables"
      leftSectionPointerEvents="none"
      leftSection={"FEN"}
      variant="filled"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
